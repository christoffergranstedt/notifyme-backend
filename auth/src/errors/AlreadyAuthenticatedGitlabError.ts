import { CustomError } from "@granch_web/common"

export class AlreadyAuthenticatedGitlabError extends CustomError {
	constructor() {
		const message = 'You have already authenticated your Gitlab account'
    super(message)
		this.setErrors([{ message: message }])
		this.setStatusCode(500)
  }
}