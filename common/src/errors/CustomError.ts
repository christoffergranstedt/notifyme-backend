export class CustomError extends Error {
	private _errors: { message: string }[]
	private _statusCode: number

	constructor(message: string) {
    super(message)
		this._errors = ([{ message: message }])
		this._statusCode = 500
    Object.setPrototypeOf(this, CustomError.prototype)
  }

	public getErrors (): { message: string }[] {
		return this._errors
	}

	public setErrors (errors: { message: string }[] ) : void {
		this._errors = errors
	}

	public getStatusCode () : number {
		return this._statusCode
	}

	public setStatusCode (statusCode: number) : void {
		this._statusCode = statusCode
	}
}
