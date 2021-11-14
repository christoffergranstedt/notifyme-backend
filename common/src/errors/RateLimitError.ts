import { CustomError } from './CustomError'

export class RateLimitError extends CustomError {
	constructor() {
		const message = 'Too many requests, please try again later'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(429)
  }
}