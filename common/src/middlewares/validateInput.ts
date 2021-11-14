import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

import { InputValidationError } from '../errors/InputValidationError'

interface ExtratedErrors {
	message: string
}

export const validateInput = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req)

	if (errors.isEmpty()) {
		return next()
	}

	const extractedErrors: ExtratedErrors[] = []
	errors.array().map(error => extractedErrors.push({ message: error.msg }))
	next(new InputValidationError(extractedErrors))
}
