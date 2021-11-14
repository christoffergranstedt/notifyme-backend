import { CustomError } from './CustomError'

export class UnAuthorizedError extends CustomError {
	constructor() {
		const message = 'You are not permitted to change this resource, or possibly is your permission level to low to create new resources'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(403)
  }
}