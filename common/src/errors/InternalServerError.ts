import { CustomError } from './CustomError'

export class InternalServerError extends CustomError {
	constructor(message: string) {
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(500)
  }
}