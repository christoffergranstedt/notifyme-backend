import { UnauthenticatedError } from "@granch_web/common"
import { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      group?: { id: string };
    }
  }
}

export const verifyGitlabToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { GITLAB_WEBHOOK_TOKEN } = process.env
		if (!GITLAB_WEBHOOK_TOKEN) {
			throw new Error('An access token secret need to be provided')
		}

		if (!req.headers && !req.headers['x-gitlab-token']) return res.status(401).send()
		const groupAndToken = req.headers?.['x-gitlab-token']?.toString()

		if (!groupAndToken) return res.status(401).send()

		const groupId = groupAndToken.split('-')[0]
		const token = groupAndToken.split('-')[1]

		if (!token || !groupId) return res.status(401).send()

		req.group = { id: groupId }
		return next()
	} catch (error) {
		console.log(error)
		throw new UnauthenticatedError()
	}
}