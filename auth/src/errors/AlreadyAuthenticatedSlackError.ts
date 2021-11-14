import { CustomError } from "@granch_web/common"

export class AlreadyAuthenticatedSlackError extends CustomError {
	constructor() {
		const message = 'You have already authenticated your Slack account'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(500)
  }
}