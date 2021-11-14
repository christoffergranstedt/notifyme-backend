import { Subjects } from '../subjects'

export interface EventUserReadyEvent {
  subject: Subjects.UserReadyEvent;
  data: {
		users: {userId: string }[]
		eventType: string;
		groupId: string;
		projectId: string;
		projectUrl: string;
		author: string;
		authorAvatar?: string;
		name: string;
		description: string;
		action?: string;
		date: Date,
  };
}
