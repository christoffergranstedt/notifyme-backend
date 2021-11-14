import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import cryptoRandomString from 'crypto-random-string'
import { User } from '../models/user'
import { UnauthenticatedError, InternalServerError } from '@granch_web/common'
import { userCreatedPublisher } from '../config/natsStreaming'

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
	const { username, password } = req.body
	const user = await User.authenticate({ username, password })

	const { ACCESS_TOKEN_SECRET } = process.env
	if (!ACCESS_TOKEN_SECRET) throw new InternalServerError("ACCESS_TOKEN_SECRET is not defined")

	const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

	const refreshToken = cryptoRandomString({ length: 64, type: 'base64' })

	await User.storeRefreshToken({ userId: user.id, refreshToken})

	res.locals.data = {
		message: 'You are now authenticate',
		user: {
			userId: user.id,
			username: user.username,
			accessToken: accessToken,
			accessTokenExpirationDate: new Date().getTime() + (1000 * 60 * 60),
			refreshToken: refreshToken,
			hasAuthenticatedGitlab: user.hasAuthenticatedGitlab,
			hasAuthenticatedSlack: user.hasAuthenticatedSlack
		}
	}
	res.status(200)
	return next()

}

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
	const { username, password } = req.body
	const user = await User.build({username, password})
	res.locals.data = {
		message: `Successfully registered`,
	}
	userCreatedPublisher.publish({ userId: user.id })
	res.status(201)
	return next()
}

const signoutUser = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) return next()
	await User.storeRefreshToken({ userId: req.user.id, refreshToken: '' })
	res.locals.data = {
		message: `Successfully signed out user`,
	}
	res.status(200)
	return next()
}

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
	const { ACCESS_TOKEN_SECRET } = process.env
	if (!ACCESS_TOKEN_SECRET) throw new InternalServerError("ACCESS_TOKEN_SECRET is not defined")

	const authType = req.headers.authorization?.split(' ')[0]
	const refreshToken = req.headers.authorization?.split(' ')[1]
	if (!authType || authType !== 'Bearer' || !refreshToken) return next(new UnauthenticatedError())
	const { userId } = req.body

	const user = await User.authenticateRefreshToken({userId, refreshToken})

	const accessToken = await jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '1h', })

	const newRefreshToken = cryptoRandomString({ length: 64, type: 'base64' })

	await User.storeRefreshToken({ userId: user.id, refreshToken: newRefreshToken})

	res.locals.data = {
		message: 'You have now refreshed your access token and refresh token',
		user: {
			accessToken: accessToken,
			accessTokenExpirationDate: new Date().getTime() + (1000 * 60 * 60),
			refreshToken: newRefreshToken
		}
	}

	res.status(200)
	return next()
}


const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
	res.locals.data = {
		message: `User is signed in`,
		user: req.user
	}
	res.status(200)
	return next()
}

export const accountsController = { authenticateUser, registerUser, signoutUser, getCurrentUser, refreshAccessToken }
