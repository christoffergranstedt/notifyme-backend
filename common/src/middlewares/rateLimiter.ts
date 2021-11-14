import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'

import { RateLimitError } from '../errors/RateLimitError.js'

export const apiRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	handler: (req: Request, res: Response, next: NextFunction) => {
		throw new RateLimitError()
	}
})
