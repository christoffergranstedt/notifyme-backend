import { CustomError } from './CustomError'

export class WrongRefreshTokenError extends CustomError {
	constructor() {
		const message = 'You have provided an incorrect refresh token or user id, please login again instead'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(401)
  }
}
