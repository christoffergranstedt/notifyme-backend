import { CustomError } from './CustomError'

export class NotFoundError extends CustomError {
	constructor() {
		const message = 'Route not found'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(404)
  }
}