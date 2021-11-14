import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { UnauthenticatedError } from '../errors/UnauthenticatedError'

interface UserPayload {
  id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { ACCESS_TOKEN_SECRET } = process.env
		if (!ACCESS_TOKEN_SECRET) {
			throw new Error('An access token secret need to be provided')
		}

		const authType = req.headers.authorization?.split(' ')[0]
		const accessToken = req.headers.authorization?.split(' ')[1]
		if (!authType || authType !== 'Bearer' || !accessToken) return next(new UnauthenticatedError())

		const tokenPayload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as UserPayload
		req.user = tokenPayload
		return next()
	} catch (error) {
		console.log(error)
		throw new UnauthenticatedError()
	}
}
