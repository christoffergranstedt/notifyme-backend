import { Request, Response, NextFunction } from 'express'
import axios, { AxiosResponse } from 'axios'
import cryptoRandomString from 'crypto-random-string'
import { User } from '../models/user'
import { HTTPMethod, UnauthenticatedError, UnAuthorizedError } from '@granch_web/common'
import { slackAuthenticatedPublisher } from '../config/natsStreaming'
import { AlreadyAuthenticatedSlackError } from '../errors/AlreadyAuthenticatedSlackError'

interface SlackResponse extends AxiosResponse {
	data: {
		incoming_webhook: {
			channel: string
			channel_id: string
			url: string
		}
	}
}

const startAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
	const { SLACK_APP_ID } = process.env
	if (!req.user) throw new UnauthenticatedError()

	const user = await User.getCurrentUser(req.user.id)
	if (!user) throw new UnauthenticatedError()

	// TODO if (user.hasAuthenticatedSlack) throw new AlreadyAuthenticatedSlackError()
	const state = cryptoRandomString({ length: 64, type: 'url-safe' })

	await User.addExternalAuthData(req.user.id, { codeVerifier: '', state: state })
	res.redirect(`https://slack.com/oauth/v2/authorize?scope=incoming-webhook&client_id=${SLACK_APP_ID}&state=${state}`)
}

const authenticateCallback = async (req: Request, res: Response, next: NextFunction) => {
	const { SLACK_APP_ID, SLACK_APP_SECRET, SLACK_REDIRECT_URI } = process.env
	if (!req.query.code || !req.query.state) throw new UnAuthorizedError()

	const code = req.query.code
	const state = req.query.state

	if (!req.user) throw new UnAuthorizedError()
	const user = await User.getCurrentUser(req.user.id)
	if (user.state !== state) throw new UnAuthorizedError()

	const slackResponse: SlackResponse = await axios({
		url: `https://slack.com/api/oauth.v2.access?code=${code}&client_id=${SLACK_APP_ID}&client_secret=${SLACK_APP_SECRET}&redirect_uri=${SLACK_REDIRECT_URI}`,
		method: HTTPMethod.POST,
		headers: {
			'Content-Type': 'application/x-form-urlencoded'
		}
	})

	await User.isAuthenticatedSlack({ userId: req.user.id, isAuthenticated: true })
		
	slackAuthenticatedPublisher.publish({
		userId: req.user.id,
		accessURL: slackResponse.data.incoming_webhook.url
	})

	return res.redirect(`/profile/${req.user.id}?auth-slack=true`)
}



export const accountsSlackController = { startAuthenticate, authenticateCallback }
