import { CustomError } from './CustomError'

export class NotUniqueError extends CustomError {
	constructor(notUniqueValue: string) {
		const message = `Following entry already exist and needs to change: ${notUniqueValue}`
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(400)
  }
}