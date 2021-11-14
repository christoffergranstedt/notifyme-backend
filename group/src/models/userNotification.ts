import mongoose from 'mongoose'
import { UnauthenticatedError, UnAuthorizedError, UserAlreadyExistError, UsernameIsTakenError, WrongCredentialsError, WrongRefreshTokenError } from '@granch_web/common'
import { GitlabProjectData } from '../utils/interfaces/GitlabProjectData'
import { GitlabGroupData } from '../utils/interfaces/GitlabGroupData'

export interface UserNotificationSettingsInput {
	wantsReleaseEvents: boolean,
	wantsIssueEvents: boolean
}


export interface Project {
	projectId: string,
	name: string,
	nameWithNameSpace: string,
	url: string,
	wantsReleaseEvents: boolean,
	wantsIssueEvents: boolean
}

export interface Group {
	groupId: string;
	name: string,
	fullName: string;
	url: string;
	projects?: Project[] | any[];
}


// An interface that describes the properties
// that are requried to create a new User
interface UserNotificationInput {
	userId: string
	accessTokenGitlab: string
	refreshTokenGitlab: string
}

// An interface that describes the properties
// that a User Document has
interface UserNotificationDoc extends mongoose.Document {
	userId: string
	accessTokenGitlab: string
	refreshTokenGitlab: string
	groups: Group[] |  any[]
}

// An interface that describes the properties
// that a User Model has
interface UserNotificationModel extends mongoose.Model<UserNotificationDoc> {
	updateProjectNotifications(userId: string, groupId: string, projectId: string, userNotification: UserNotificationSettingsInput) : Promise<void>
	build(userInput: UserNotificationInput): Promise<MinimumUserOutput>
	getCurrentUser(userId: string): Promise<MinimumUserOutput>
	getAndUpdateUserGroups(userId: string, groups: GitlabGroupData[]): Promise<Group[] | []>
	getAndUpdateUserProjects(userId: string, groupId: string, projects: GitlabProjectData[]): Promise<Project[] | []>
	getUsersNotificationsRequest(projectId: string): Promise<{ userId: string }[]>
}

const userNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
			unique: true
    },
    accessTokenGitlab: {
      type: String,
      required: true,
			unique: true
    },
    refreshTokenGitlab: {
      type: String,
      required: true,
			unique: true
    },
		groups: [{
			groupId: { type: String },
			name: { type: String },
			fullName: { type: String },
			url: { type: String },
			projects: [{
				projectId: { type: String },
				name: { type: String },
				nameWithNameSpace: { type: String },
				url: { type: String },
				wantsReleaseEvents: { type: Boolean },
				wantsIssueEvents: { type: Boolean }
			}]
		}]
  }
)


interface MinimumUserOutput {
	userId: string;
	accessTokenGitlab: string;
	refreshTokenGitlab: string;
}

userNotificationSchema.statics.build = async (userInput: UserNotificationInput) : Promise<MinimumUserOutput> => {
	const existingUser = await UserNotification.findOne({ userId: userInput.userId })
	if (existingUser && existingUser.userId) throw new UserAlreadyExistError()

	const user = new UserNotification(userInput)
	user.save()
	return {
		userId: user.userId,
		accessTokenGitlab: user.accessTokenGitlab,
		refreshTokenGitlab: user.refreshTokenGitlab
	}
}

userNotificationSchema.statics.getCurrentUser = async (userId: string) : Promise<MinimumUserOutput>  => {
	const user = await UserNotification.findOne({ userId: userId })
	if (!user) throw new UnauthenticatedError()

	return {
		userId: user.userId,
		accessTokenGitlab: user.accessTokenGitlab,
		refreshTokenGitlab: user.refreshTokenGitlab
	}
}

userNotificationSchema.statics.getAndUpdateUserGroups = async (userId: string, groups: GitlabGroupData[]) : Promise<Group[]>  => {
	const user = await UserNotification.findOne({ userId: userId })
	if (!user) throw new UnauthenticatedError()

	if (user.groups && user.groups.length > 0) {
		for (let i = 0; i < groups.length; i++) {
			const groupExist = user.groups.some(groupsInDB =>groupsInDB.groupId === groups[i].id.toString())
			if (!groupExist) user.groups.push({ groupId: groups[i].id.toString(), name: groups[i].name, fullName: groups[i].full_name, url: groups[i].web_url, projects: [] })
		}
	} else {
		user.groups = []
		for (let i = 0; i < groups.length; i++) {
			user.groups.push({ groupId: groups[i].id.toString(), name: groups[i].name, fullName: groups[i].full_name, url: groups[i].web_url, projects: [] })
		}
	}
	user.save()
	return user.groups
}

userNotificationSchema.statics.getAndUpdateUserProjects = async (userId: string, groupId: string, projects: GitlabProjectData[]) : Promise<Project[] | []>  => {
	const user = await UserNotification.findOne({ userId: userId })
	if (!user) throw new UnauthenticatedError()

	if (!user.groups || !projects) return []

	const group = user.groups.find((group) => group?.groupId === groupId)
	if (!group) return []

	if (group.projects && group.projects.length > 0) {
		for (let i = 0; i < projects.length; i++) {
			const projectsExist = group.projects.some((projectsInDB : Project) => projectsInDB.projectId === projects[i].id.toString())
			if (!projectsExist) group.projects.push({ projectId: projects[i].id, name: projects[i].name, nameWithNameSpace: projects[i].name_with_namespace, url: projects[i].web_url, wantsReleaseEvents: false, wantsIssueEvents: false })
		}
	} else {
		group.projects = []
		for (let i = 0; i < projects.length; i++) {
			group.projects.push({ projectId: projects[i].id, name: projects[i].name, nameWithNameSpace: projects[i].name_with_namespace, url: projects[i].web_url, wantsReleaseEvents: false, wantsIssueEvents: false })
		}
	}

	user.save()

	return group.projects
}
userNotificationSchema.statics.updateProjectNotifications = async (userId: string, groupId: string, projectId: string, userNotification: UserNotificationSettingsInput) : Promise<void>  => {
	const user = await UserNotification.findOne({ userId: userId })
	if (!user) throw new UnAuthorizedError()

	if (!user.groups) return

	const group = user.groups.find((group) => group?.groupId === groupId)
	if (!group && group.projects) return

	const project: Project = group.projects.find((project: Project) => project.projectId.toString() === projectId)
	project.wantsIssueEvents = userNotification.wantsIssueEvents === undefined ? project.wantsIssueEvents : userNotification.wantsIssueEvents
	project.wantsReleaseEvents = userNotification.wantsReleaseEvents === undefined ? project.wantsReleaseEvents : userNotification.wantsReleaseEvents

	if (!project.wantsIssueEvents && !project.wantsReleaseEvents) {
		const index = group.projects.findIndex((project: Project) => project.projectId.toString() === projectId)
		group.projects.splice(index, 1)
	}

	user.save()
}


userNotificationSchema.statics.getUsersNotificationsRequest = async (projectId: string) : Promise<{ userId: string }[]>  => {
	const users = await UserNotification.find({ 'groups.projects.projectId': projectId })
	const usersWithUserId: { userId: string}[] = users.map((user) => {
		return { userId: user.userId }
	})

	return usersWithUserId
}

export const UserNotification = mongoose.model<UserNotificationDoc, UserNotificationModel>('UserNotification', userNotificationSchema)
