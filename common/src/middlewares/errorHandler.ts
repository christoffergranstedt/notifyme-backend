import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors/CustomError'

export const errorHandler = ((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.log(err)
	
	if (err instanceof CustomError) {
		return res.status(err.getStatusCode()).json({ errors: err.getErrors() })
	}

	res.status(500).json({
		errors: [{ message: 'Something went wrong in the server, please try again' }]
	})
})