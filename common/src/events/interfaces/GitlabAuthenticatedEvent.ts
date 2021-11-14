import { Subjects } from '../subjects'

export interface GitlabAuthenticatedEvent {
  subject: Subjects.GitlabAuthenticated;
  data: {
    userId: string;
		accessTokenGitlab: string;
		refreshTokenGitlab: string;
  };
}
