import { CustomError } from './CustomError'

export class UsernameIsTakenError extends CustomError {
	constructor() {
		const message = 'Username is already taken, please test another'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(400)
  }
}