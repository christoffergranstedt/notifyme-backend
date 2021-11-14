import mongoose from 'mongoose'
import { UnauthenticatedError, UserAlreadyExistError } from '@granch_web/common'

// An interface that describes the properties
// that are requried to create a new User
interface UserNotificationAttributes {
	userId: string;
	accessURL: string;
}

// An interface that describes the properties
// that a User Document has
interface UserNotificationDoc extends mongoose.Document {
	userId: string;
	accessURL: string;
}

// An interface that describes the properties
// that a User Model has
interface UserNotificationModel extends mongoose.Model<UserNotificationDoc> {
	build(userInput: UserNotificationAttributes): Promise<UserNotificationAttributes>
	getCurrentUser(userId: string): Promise<UserNotificationAttributes>
}

const userNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
			unique: true
    },
    accessURL: {
      type: String,
      required: true,
			unique: true
    }
  }
)

userNotificationSchema.statics.build = async (userInput: UserNotificationAttributes) : Promise<UserNotificationAttributes> => {
	const existingUser = await UserNotification.findOne({ userId: userInput.userId })
	if (existingUser && existingUser.userId) throw new UserAlreadyExistError()

	const user = new UserNotification(userInput)
	user.save()
	return {
		userId: user.userId,
		accessURL: user.accessURL
	}
}

userNotificationSchema.statics.getCurrentUser = async (userId: string) : Promise<UserNotificationAttributes>  => {
	const user = await UserNotification.findOne({ userId: userId })
	if (!user) throw new UnauthenticatedError()

	return {
		userId: user.userId,
		accessURL: user.accessURL
	}
}

const UserNotification = mongoose.model<UserNotificationDoc, UserNotificationModel>('UserNotification', userNotificationSchema)

export { UserNotification }
