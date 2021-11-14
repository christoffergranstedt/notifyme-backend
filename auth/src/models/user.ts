import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { UnauthenticatedError, UsernameIsTakenError, WrongCredentialsError, WrongRefreshTokenError } from '@granch_web/common'

// An interface that describes the properties
// that are requried to create a new User
interface UserInput {
  username: string;
  password: string;
}

interface UserOutput {
	id: string;
	username: string;
	hasAuthenticatedGitlab: boolean;
	hasAuthenticatedSlack: boolean;
}

interface UserWithExternalAuthOutput {
	id: string;
	username: string;
	hasAuthenticatedGitlab: boolean;
	hasAuthenticatedSlack: boolean;
	codeVerifier: string,
	state: string
}

interface IsAuthenticated {
	userId: string;
	isAuthenticated: boolean;
}

interface RefreshTokenAuth {
	userId: string,
	refreshToken: string
}

interface ExternalAuthData {
	codeVerifier: string,
	state: string
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  username: string;
  password: string;
	refreshToken: string;
	hasAuthenticatedGitlab: boolean;
	hasAuthenticatedSlack: boolean;
	codeVerifier: string;
	state: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(userInput: UserInput): Promise<UserOutput>;
	authenticate(userInput: UserInput) : Promise<UserOutput>;
	authenticateRefreshToken(refreshTokenAttributes: RefreshTokenAuth) : Promise<UserOutput>;
	storeRefreshToken(refreshTokenAttributes: RefreshTokenAuth) : Promise<UserOutput>;
	addExternalAuthData(userId: string, externalAuthData: ExternalAuthData) : Promise<void>;
	getCurrentUser(userId: string) : Promise<UserWithExternalAuthOutput>;
	isAuthenticatedGitlab(authData: IsAuthenticated): Promise<void>;
	isAuthenticatedSlack(authData: IsAuthenticated): Promise<void>;
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
			unique: true
    },
    password: {
      type: String,
      required: true,
			unique: false
    },
		refreshToken: {
			type: String,
			required: false,
			unique: false
		},
		hasAuthenticatedGitlab: {
			type: Boolean,
			required: true,
			default: false
		},
		hasAuthenticatedSlack: {
			type: Boolean,
			required: true,
			default: false
		},
		codeVerifier: {
			type: String
		},
		state: {
			type: String
		}
  }
)

userSchema.statics.build = async (userInput: UserInput) : Promise<UserOutput> => {
	const userExist = await User.exists({ username: userInput.username })
	if (userExist) throw new UsernameIsTakenError()
	userInput.password = await bcrypt.hash(userInput.password, 10)
	const user = new User(userInput)
	user.save()
	return {
		id: user._id,
		username: user.username,
		hasAuthenticatedGitlab: user.hasAuthenticatedGitlab,
		hasAuthenticatedSlack: user.hasAuthenticatedSlack
	}
}

userSchema.statics.authenticate = async (userInput: UserInput) : Promise<UserOutput> => {
	const userExist = await User.exists({ username: userInput.username })
	if (!userExist) throw new WrongCredentialsError()
	const user = await User.findOne({ username: userInput.username })
	if (!user || !await bcrypt.compare(userInput.password, user.password)) throw new WrongCredentialsError()
	return {
		id: user._id,
		username: user.username,
		hasAuthenticatedGitlab: user.hasAuthenticatedGitlab,
		hasAuthenticatedSlack: user.hasAuthenticatedSlack
	}
}

userSchema.statics.authenticateRefreshToken = async (refreshTokenAttributes: RefreshTokenAuth) : Promise<UserOutput> => {
	const user = await User.findById(refreshTokenAttributes.userId)
	if (!user || !await bcrypt.compare(refreshTokenAttributes.refreshToken, user.refreshToken)) throw new WrongRefreshTokenError()
	return {
		id: user._id,
		username: user.username,
		hasAuthenticatedGitlab: user.hasAuthenticatedGitlab,
		hasAuthenticatedSlack: user.hasAuthenticatedSlack
	}
}

userSchema.statics.storeRefreshToken = async (refreshTokenAttributes: RefreshTokenAuth) : Promise<UserOutput> => {
	const user = await User.findById(refreshTokenAttributes.userId)
	if (!user) throw new UnauthenticatedError()
	const hashedRefreshToken = await bcrypt.hash(refreshTokenAttributes.refreshToken, 10)
	user.refreshToken = hashedRefreshToken
	user.save()
	return {
		id: user._id,
		username: user.username,
		hasAuthenticatedGitlab: user.hasAuthenticatedGitlab,
		hasAuthenticatedSlack: user.hasAuthenticatedSlack
	}
}

userSchema.statics.addExternalAuthData = async (userId: string, externalAuthData: ExternalAuthData): Promise<void>=> {
	const user = await User.findById(userId)
	if (!user) throw new UnauthenticatedError()
	user.codeVerifier = externalAuthData.codeVerifier
	user.state = externalAuthData.state
	user.save()
}

userSchema.statics.isAuthenticatedGitlab = async (authData: IsAuthenticated): Promise<void> => {
	const user = await User.findById(authData.userId)
	if (!user) throw new UnauthenticatedError()
	user.codeVerifier = ''
	user.state = ''
	user.hasAuthenticatedGitlab = authData.isAuthenticated
	user.save()
}

userSchema.statics.isAuthenticatedSlack = async (authData: IsAuthenticated) : Promise<void> => {
	const user = await User.findById(authData.userId)
	if (!user) throw new UnauthenticatedError()
	user.codeVerifier = ''
	user.state = ''
	user.hasAuthenticatedSlack = authData.isAuthenticated
	user.save()
}

userSchema.statics.getCurrentUser = async (userId: string) : Promise<UserWithExternalAuthOutput>  => {
	const user = await User.findById(userId)
	if (!user) throw new UnauthenticatedError()

	return {
		id: user._id,
		username: user.username,
		hasAuthenticatedGitlab: user.hasAuthenticatedGitlab,
		hasAuthenticatedSlack: user.hasAuthenticatedSlack,
		codeVerifier: user.codeVerifier,
		state: user.state
	}
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
