import { CustomError } from './CustomError'

export class DataBaseError extends CustomError {
	constructor() {
		const message = 'Internal database connection error'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(500)
  }
}