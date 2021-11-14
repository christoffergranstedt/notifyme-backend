import { CustomError } from './CustomError'

export class UnauthenticatedError extends CustomError {
	constructor() {
		const message = 'You are not authenticated for this endpoint, possibly wrong token or passed in wrong format in request headers "Authorization" ("Bearer <Token>")'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(401)
  }
}