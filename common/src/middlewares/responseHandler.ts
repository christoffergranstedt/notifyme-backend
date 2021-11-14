import { Request, Response, NextFunction } from 'express'

export const responseHandler = async (req: Request, res: Response, next: NextFunction) => {
	return res.json(res.locals.data)
}
