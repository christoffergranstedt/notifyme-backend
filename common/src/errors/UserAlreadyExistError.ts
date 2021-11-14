import { CustomError } from './CustomError'

export class UserAlreadyExistError extends CustomError {
	constructor() {
		const message = 'User already exist, can not create a new record'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(400)
  }
}