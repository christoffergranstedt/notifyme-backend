import mongoose from 'mongoose'
import { DataBaseError, NoResourceFoundError } from '@granch_web/common'

export interface HookOutput {
	webhookId: string;
	projectId: string;
	nrOfUsersWantIssueEvents: number;
	nrOfUsersWantReleaseEvents: number;
}

interface HookAttributes {
	webhookId: string;
	projectId: string;
	wantsIssueEvents: boolean;
	wantsReleaseEvents: boolean;
}

interface HookDoc extends mongoose.Document {
	webhookId: string;
	projectId: string;
	nrOfUsersWantIssueEvents: number;
	nrOfUsersWantReleaseEvents: number;
}

interface HookModel extends mongoose.Model<HookDoc> {
	build(userInput: HookAttributes): Promise<HookOutput>;
	updateHook(userInput: HookAttributes): Promise<HookOutput>;
	getProjectHook(projectId: string): Promise<HookOutput | null>;
	removeHook(webhookId: string): Promise<void>;
}

const hookSchema = new mongoose.Schema(
  {
    webhookId: {
      type: String,
      required: true,
			unique: true
    },
    projectId: {
      type: String,
      required: true,
			unique: true
    },
    nrOfUsersWantIssueEvents: {
      type: Number,
      required: true,
			unique: true
    },
    nrOfUsersWantReleaseEvents: {
      type: Number,
      required: true,
			unique: true
    }
  }
)

hookSchema.statics.build = async (hookInput: HookAttributes): Promise<HookOutput> => {
	const hooksAtt = { 
		...hookInput,
		nrOfUsersWantIssueEvents: hookInput.wantsIssueEvents ? 1 : 0,
    nrOfUsersWantReleaseEvents: hookInput.wantsReleaseEvents ? 1 : 0
	}

	const hook = new Hook(hooksAtt)
	hook.save()
	return {
		webhookId: hook.webhookId,
		projectId: hook.projectId,
		nrOfUsersWantIssueEvents: hook.nrOfUsersWantIssueEvents,
		nrOfUsersWantReleaseEvents: hook.nrOfUsersWantReleaseEvents
	}
}

hookSchema.statics.updateHook = async (hookInput: HookAttributes): Promise<HookOutput | void> => {
	const hook = await Hook.findOne({ webhookId: hookInput.webhookId })
	if (!hook) throw new NoResourceFoundError(parseInt(hookInput.webhookId))

	if (hookInput.wantsIssueEvents !== undefined) {
		hook.nrOfUsersWantIssueEvents = hookInput.wantsIssueEvents ? hook.nrOfUsersWantIssueEvents + 1 : hook.nrOfUsersWantIssueEvents - 1
	}

	if (hookInput.wantsReleaseEvents !== undefined) {
		hook.nrOfUsersWantReleaseEvents = hookInput.wantsReleaseEvents ? hook.nrOfUsersWantReleaseEvents + 1 : hook.nrOfUsersWantReleaseEvents - 1
	}
	
	hook.save()

	return {
		webhookId: hook.webhookId,
		projectId: hook.projectId,
		nrOfUsersWantIssueEvents: hook.nrOfUsersWantIssueEvents,
		nrOfUsersWantReleaseEvents: hook.nrOfUsersWantReleaseEvents
	}
}

hookSchema.statics.removeHook = async (projectId: string): Promise<void> => {
	try {
		await Hook.deleteOne({ projectId: projectId })
	} catch (error) {
		throw new DataBaseError()
	}
}

hookSchema.statics.getProjectHook = async (projectId: string): Promise<HookOutput | null> => {
	try {
		const hook = await Hook.findOne({ projectId: projectId })
		if (!hook) return null

		return {
			webhookId: hook.webhookId,
			projectId: hook.projectId,
			nrOfUsersWantIssueEvents: hook.nrOfUsersWantIssueEvents,
			nrOfUsersWantReleaseEvents: hook.nrOfUsersWantReleaseEvents
		}
	} catch (error) {
		throw new DataBaseError()
	}
}

export const Hook = mongoose.model<HookDoc, HookModel>('Hook', hookSchema)
