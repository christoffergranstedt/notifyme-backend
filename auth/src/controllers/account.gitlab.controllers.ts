import { Request, Response, NextFunction } from 'express'
import axios, { AxiosResponse } from 'axios'
import crypto from 'crypto'
import cryptoRandomString from 'crypto-random-string'
import { User } from '../models/user'
import { HTTPMethod, UnauthenticatedError, UnAuthorizedError } from '@granch_web/common'
import base64url from 'base64url'
import { gitlabAuthenticatedPublisher } from '../config/natsStreaming'
import { AlreadyAuthenticatedGitlabError } from '../errors/AlreadyAuthenticatedGitlabError'
import pkceChallenge from 'pkce-challenge'

interface GitlabResponse extends AxiosResponse {
	data: {
		access_token: string
		refresh_token: string
	}
}

const startAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
	const { GITLAB_APP_ID, GITLAB_REDIRECT_URI } = process.env
	if (!req.user) throw new UnauthenticatedError()

	const user = await User.getCurrentUser(req.user.id)
	if (!user) throw new UnauthenticatedError()

	// TODO if (user.hasAuthenticatedGitlab) throw new AlreadyAuthenticatedGitlabError()

	const state = cryptoRandomString({ length: 64, type: 'url-safe' })

	const { code_verifier, code_challenge } = pkceChallenge()
/* 	const code_verifier = cryptoRandomString({ length: 64, type: 'url-safe' })
	const base64Digest = crypto
		.createHash("sha256")
		.update(code_verifier)
		.digest("base64")
	const code_challenge = base64url.fromBase64(base64Digest) */

	await User.addExternalAuthData(req.user.id, { codeVerifier: code_verifier, state: state })

	const scope = 'api+read_user'
	const url = `https://gitlab.lnu.se/oauth/authorize?client_id=${GITLAB_APP_ID}&redirect_uri=${GITLAB_REDIRECT_URI}&response_type=code&state=${state}&scope=${scope}&code_challenge=${code_challenge}&code_challenge_method=S256`
	return res.redirect(url)
}

const authenticateCallback = async (req: Request, res: Response, next: NextFunction) => {
	const { GITLAB_APP_ID, GITLAB_APP_SECRET, GITLAB_REDIRECT_URI } = process.env
	if (!req.query.code || !req.query.state) throw new UnAuthorizedError()

	const code = req.query.code
	const state = req.query.state

	if (!req.user) throw new UnAuthorizedError()
	const user = await User.getCurrentUser(req.user.id)
	if (user.hasAuthenticatedGitlab) throw new AlreadyAuthenticatedGitlabError()

	if (user.state !== state) throw new UnAuthorizedError()
	
	const url = `https://gitlab.lnu.se/oauth/token?client_id=${GITLAB_APP_ID}&client_secret=${GITLAB_APP_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${GITLAB_REDIRECT_URI}&code_verifier=${user.codeVerifier}`
	const gitlabResponse: GitlabResponse = await axios({
		url: url,
		method: HTTPMethod.POST,
		headers: {
			'Content-Type': 'application/x-form-url'
		}
	})

	await User.isAuthenticatedGitlab({ userId: req.user.id, isAuthenticated: true })
	
	await gitlabAuthenticatedPublisher.publish({
		userId: req.user.id,
		accessTokenGitlab: gitlabResponse.data.access_token,
		refreshTokenGitlab: gitlabResponse.data.refresh_token
	})

	return res.redirect(`/profile/${req.user?.id}?auth-gitlab=true`)
}



export const accountsGitlabController = { startAuthenticate, authenticateCallback }
