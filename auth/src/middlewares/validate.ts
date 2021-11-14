import { body } from 'express-validator'

export const validateUserInput = [
	body('username')
		.isLength({ min: 1, max: 50 }).withMessage('Username is required and need to be between 1 and 50 characters.')
		.trim()
		.escape(),
	body('password')
		.isLength({ min: 6, max: 2000 }).withMessage('Password is required and need to be between 6 and 2000 characters.')
		.trim()
		.escape()
]