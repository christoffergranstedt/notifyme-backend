import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { HTTPMethod, NoResourceFoundError, UnAuthorizedError } from '@granch_web/common'
import { UserNotification, Project, Group } from '../models/userNotification'
import { GitlabGroupData } from '../utils/interfaces/GitlabGroupData'
import { GitlabProjectData } from '../utils/interfaces/GitlabProjectData'
import { Hook } from '../models/hook'

const getUserGroups = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) throw new UnAuthorizedError()
	const user = await UserNotification.getCurrentUser(req.user.id)

	const { data: groups } = await axios({
		url: `https://gitlab.lnu.se/api/v4/groups?per_page=100&page=${1}&min_access_level=30`,
		method: HTTPMethod.GET,
		headers: {
			Authorization: `Bearer ${user.accessTokenGitlab}`
		}
	})

	const filteredGroups: GitlabGroupData[] = groups.map((group: GitlabGroupData) => {
		return {
			id: group.id.toString(),
			name: group.name,
			full_name: group.full_name,
			web_url: group.web_url,
			visibility: group.visibility
		}
	})

	const returnGroups: Group[] = await UserNotification.getAndUpdateUserGroups(req.user.id, filteredGroups)

	res.locals.data = {
		message: 'All groups associated with you',
		groups: returnGroups
	}
	res.status(200)
	return next()
}

const getProjectsInGroup = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) throw new UnAuthorizedError()
	const user = await UserNotification.getCurrentUser(req.user.id)

	const { groupId } = req.params
	if (!groupId) throw new NoResourceFoundError(parseInt(groupId))

	const { data: projects } = await axios({
		url: `https://gitlab.lnu.se/api/v4/groups/${groupId}/projects?per_page=100&page=${1}&min_access_level=30`,
		method: HTTPMethod.GET,
		headers: {
			Authorization: `Bearer ${user.accessTokenGitlab}`
		}
	})

	// data.headers['x-next-page'] // TODO

	const filteredProjects: GitlabProjectData[] = projects.map((project: GitlabProjectData) => {
		return {
			id: project.id,
			name: project.name,
			name_with_namespace: project.name_with_namespace,
			web_url: project.web_url
		}
	})
	
	const returnProjects: Project[] = await UserNotification.getAndUpdateUserProjects(req.user.id, req.params.groupId, filteredProjects)

	res.locals.data = {
		message: 'All projects associated with you is fetched',
		projects: returnProjects
	}
	res.status(200)
	return next()
}

const updateNotificationSettings = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!process.env.GITLAB_WEBHOOK_TOKEN) throw new Error('GITLAB_WEBHOOK_TOKEN is not set')
		if (!req.user) throw new UnAuthorizedError()
		const user = await UserNotification.getCurrentUser(req.user.id)

		const { groupId, projectId } = req.params
		if (!groupId) throw new NoResourceFoundError(parseInt(groupId))
		if (!projectId) throw new NoResourceFoundError(parseInt(projectId))

		let { wantsReleaseEvents, wantsIssueEvents } = req.body

		await UserNotification.updateProjectNotifications(req.user.id, groupId, projectId, { wantsReleaseEvents,  wantsIssueEvents })

		const projectHookInDB = await Hook.getProjectHook(projectId)

		// If no project hook in database and user wants event create a new hook 
		if (!projectHookInDB) {
			const { data: gitlabHook } = await axios({
				url: `https://gitlab.lnu.se/api/v4/projects/${projectId}/hooks`,
				method: HTTPMethod.POST,
				headers: {
					Authorization: `Bearer ${user.accessTokenGitlab}`
				},
				data: {
					push_events: false,
					issues_events: wantsIssueEvents,
					releases_events: wantsReleaseEvents,
					token: `${groupId}-${process.env.GITLAB_WEBHOOK_TOKEN}`,
					url: process.env.WEBHOOK_URL,
					enable_ssl_verification: false
				}
			})
			await Hook.build({ webhookId: gitlabHook.id, projectId, wantsIssueEvents, wantsReleaseEvents })

		} else if (projectHookInDB) {
			const updatedHook = await Hook.updateHook({ webhookId: projectHookInDB.webhookId, projectId, wantsIssueEvents, wantsReleaseEvents })

			// If no user wants either issue or release event go ahead and delete hook
			if (updatedHook.nrOfUsersWantIssueEvents <= 0 && updatedHook.nrOfUsersWantReleaseEvents <= 0) {
				await axios({
					url: `https://gitlab.lnu.se/api/v4/projects/${projectId}/hooks/${updatedHook.webhookId}`,
					method: HTTPMethod.DELETE,
					headers: {
						Authorization: `Bearer ${user.accessTokenGitlab}`
					}
				})
				await Hook.removeHook(projectId)

			// Else update the hook
			} else {
				await axios({
					url: `https://gitlab.lnu.se/api/v4/projects/${projectId}/hooks/${updatedHook.webhookId}`,
					method: HTTPMethod.PUT,
					headers: {
						Authorization: `Bearer ${user.accessTokenGitlab}`
					},
					data: {
						push_events: false,
						issues_events: updatedHook.nrOfUsersWantIssueEvents > 0,
						releases_events: updatedHook.nrOfUsersWantReleaseEvents > 0,
						token: `${groupId}-${process.env.GITLAB_WEBHOOK_TOKEN}`,
						url: process.env.WEBHOOK_URL,
						enable_ssl_verification: false
					}
				})
			} 
		}

		res.locals.data = {
			message: 'The project hook have been updated'
		}
		res.status(200)
		return next()
	} catch (error) {
		// console.log(error)
	}

}

/* const fetchGroups = async (pageIndex: number, accessToken: string) => {
	return await axios({
		url: `https://gitlab.lnu.se/api/v4/groups?per_page=100&page=${pageIndex}`,
		method: HTTPMethod.GET,
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})
}

const fetchProjectsInGroup = async (groupId: string, pageIndex: number, accessToken: string) => {
	return await axios({
		url: `https://gitlab.lnu.se/api/v4/groups/${groupId}/projects?per_page=100&page=${pageIndex}`,
		method: HTTPMethod.GET,
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})
} */


export const groupsController = { getUserGroups, getProjectsInGroup, updateNotificationSettings }
