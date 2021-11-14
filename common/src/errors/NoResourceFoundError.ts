import { CustomError } from './CustomError'

export class NoResourceFoundError extends CustomError {
	constructor(id: number) {
		const message = `The resource of the id ${id} could not be found`
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(404)
  }
}