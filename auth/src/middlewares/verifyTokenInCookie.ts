import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthenticatedError } from '@granch_web/common'

interface UserPayload {
  id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
			cookies?: any
    }
  }
}

export const verifyAccessTokenInCookie = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { ACCESS_TOKEN_SECRET } = process.env
		if (!ACCESS_TOKEN_SECRET) {
			throw new Error('An access token secret need to be provided')
		}
		
		if (!req.cookies.jwt) throw new UnauthenticatedError()

		const tokenPayload = jwt.verify(req.cookies.jwt, ACCESS_TOKEN_SECRET) as UserPayload
		req.user = tokenPayload
		return next()
	} catch (error) {
		throw new UnauthenticatedError()
	}
}
