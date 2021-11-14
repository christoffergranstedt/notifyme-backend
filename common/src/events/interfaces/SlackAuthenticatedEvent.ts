import { Subjects } from '../subjects'

export interface SlackAuthenticatedEvent {
  subject: Subjects.SlackAuthenticated;
  data: {
    userId: string;
		accessURL: string;
  };
}
