import { CustomError } from './CustomError'

export class InputValidationError extends CustomError {
	constructor(errors: { message: string }[]) {
		const message = 'User input is incorrect'
    super(message)
		this.setErrors(errors)
		this.setStatusCode(400)
  }
}