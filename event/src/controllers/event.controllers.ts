import { NoResourceFoundError, UnauthenticatedError, UnAuthorizedError } from '@granch_web/common'
import { Request, Response, NextFunction } from 'express'
import { gitlabEventReceivedPublisher } from '../config/natsStreaming'
import { User } from '../models/user'
import { GitlabEvent } from '../utils/enums/GitlabEvent'

export interface GitlabReleaseEvent {
	'object_kind': string;
	url: string;
	action: string;
	name: string;
	description: string;
	project: {
		id: number,
		web_url: string
	},
	commit: {
		author: {
			name: string
		}
	}
}

export interface GitlabIssueEvent {
	'object_kind': string;
	project: {
		id: number,
		web_url: string
	},
	user: {
		name: string,
		avatar_url: string
	},
	'object_attributes': {
		title: string;
		description: string;
	}
}

const gitlabWebhook = async (req: Request, res: Response, next: NextFunction) => {
	if (!process.env.GITLAB_WEBHOOK_TOKEN) throw new Error('GITLAB WEBHOOK TOKEN is not defined')
	if (!req.group?.id) throw new UnauthenticatedError()
	
	if (req.body['object_kind'] === GitlabEvent.Issue) {
		const event: GitlabIssueEvent = req.body
		let eventType = event['object_kind']
		let groupId = req.group?.id
		let projectId = event.project.id.toString()
		let projectUrl = event.project.web_url
		let author = event.user.name
		let authorAvatar = event.user.avatar_url
		let name = event.object_attributes.title
		let description = event.object_attributes.description
		let date = new Date()

		const userInput = { eventType, groupId, projectId, projectUrl, author, authorAvatar, name, description, date }
		gitlabEventReceivedPublisher.publish(userInput)
		
	} else if (req.body['object_kind'] === GitlabEvent.Release) {
		const event: GitlabReleaseEvent = req.body
		let eventType = event['object_kind']
		let groupId = req.group?.id
		let projectId = event.project.id.toString()
		let projectUrl = event.project.web_url
		let author = event.commit.author.name
		let name = event.name
		let description = event.description
		let action = event.action
		let date = new Date()

		const userInput = { eventType, groupId, projectId, projectUrl, author, name, description, action, date }
		gitlabEventReceivedPublisher.publish(userInput)
	}
	
	res.status(200)
	next()
}

const getUserEvents = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) throw new UnAuthorizedError()
	const user = await User.getCurrentUser(req.user.id)
	if (!user) throw new UnAuthorizedError()

	const { groupId } = req.params
	if (!groupId) throw new NoResourceFoundError(0)

	const events = await User.getUserEvents(req.user.id, groupId)
	
	const returnEvents = events.map(event => {
		return {
			eventType: event.eventType,
			groupId: event.groupId,
			projectId: event.projectId,
			projectUrl:	event.projectUrl,
			author: event.author,
			authorAvatar: event.authorAvatar,
			name: event.name,
			description: event.description,
			action: event.action,
			date: event.date,
			userLastActiveOnSite: user.lastActiveOnSite
		}
	})

	const updatedUser = await User.updateLastActiveOnSite({ userId: req.user.id, isActive: true, lastActiveOnSite: new Date() })

	res.locals.data = {
		message: 'All events fetched',
		events: returnEvents,
		user: updatedUser
	}
	res.status(200)
	next()
}

const pingServer = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) throw new UnAuthorizedError()
	User.updateLastActiveOnSite({ userId: req.user.id, isActive: true, lastActiveOnSite: new Date() })
	res.status(200)
	next()
}

export const eventsController = { getUserEvents, gitlabWebhook, pingServer }
