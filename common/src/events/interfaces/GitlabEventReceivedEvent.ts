import { Subjects } from '../subjects'

export interface GitlabEventReceivedEvent {
  subject: Subjects.GitlabEventReceived;
  data: {
		eventType: string;
		groupId: string;
		projectId: string;
		projectUrl: string;
		author: string;
		authorAvatar?: string;
		name: string;
		description: string;
		action?: string;
  };
}
