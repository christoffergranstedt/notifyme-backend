import { UserAlreadyExistError } from '@granch_web/common'
import mongoose from 'mongoose'

export interface UserAttributes {
	userId: string;
	isActive?: boolean;
	lastActiveOnSite?: Date;
}

export interface EventAttributes {
	eventType: string;
	groupId: string;
	projectId: string;
	projectUrl: string;
	author: string;
	authorAvatar?: string;
	name: string;
	description: string;
	action?: string;
	date: Date;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
	userId: string;
	isActive?: boolean;
	lastActiveOnSite?: Date;
	events: EventAttributes[];
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
	build(userInput: UserAttributes): Promise<void>
	updateLastActiveOnSite(userInput: UserAttributes) : Promise<void>
	getCurrentUser(userId: string) : Promise<UserAttributes | null>
	addEventToUser(userId: string, event: EventAttributes) : Promise<void>
	getUserEvents(userId: string, groupId: string) : Promise<EventAttributes[]>
}

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean
    },
    lastActiveOnSite: {
      type: mongoose.Schema.Types.Date,
    },
		events: [{
			eventType: {
				type: String,
				required: true
			},
			groupId: {
				type: String,
				required: true
			},
			projectId: {
				type: String,
				required: true
			},
			projectUrl: {
				type: String,
				required: true
			},
			author: {
				type: String,
				required: true
			},
			authorAvatar: {
				type: String,
				required: false
			},
			name: {
				type: String,
				required: true
			},
			description: {
				type: String,
				required: true
			},
			action: {
				type: String,
				required: false
			},
			date: {
				type: mongoose.Schema.Types.Date,
				required: true
			}
		}]
  }
)

userSchema.statics.build = async (userInput: UserAttributes) : Promise<void> => {
	const existingUser = await User.findOne({ userId: userInput.userId })
	if (existingUser && existingUser.userId) throw new UserAlreadyExistError()

	const user = new User(userInput)
	user.save()
}

userSchema.statics.updateLastActiveOnSite = async (userInput: UserAttributes) : Promise<void> => {
	const user = await User.findOne({ userId: userInput.userId })
	if (!user) return

	user.lastActiveOnSite = userInput.lastActiveOnSite
	user.isActive = userInput.isActive
	user.save()
}

userSchema.statics.getCurrentUser = async (userId: string) : Promise<UserAttributes | null> => {
	const user = await User.findOne({ userId: userId })
	if (!user) return null
	return user
}

userSchema.statics.addEventToUser = async (userId: string, event: EventAttributes) : Promise<void> => {
	const user = await User.findOne({ userId: userId })
	console.log(user)
	if (!user) return
	user.events.push(event)
	user.save()
	console.log(user)
}

userSchema.statics.getUserEvents = async (userId: string, groupId: string) : Promise<EventAttributes[]> => {
	const maxNrOfEvents = 50
	const user = await User.findOne({ userId: userId })
	if (!user) return []
	
	const eventsInGroup = user.events.filter(event => event.groupId.toString() === groupId.toString())

	const returnEvents = eventsInGroup.slice(0, maxNrOfEvents)
	return returnEvents

}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
