import { CustomError } from './CustomError'

export class ResourceAlreadyExistError extends CustomError {
	constructor(resource: string) {
		const message = `Resource already exist, can not create a new one: ${resource}`
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(400)
  }
}