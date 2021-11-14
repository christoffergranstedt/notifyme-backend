import { CustomError } from './CustomError'

export class WrongCredentialsError extends CustomError {
	constructor() {
		const message = 'Wrong credentials, please try again'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(401)
  }
}