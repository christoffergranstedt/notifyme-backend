import { Subjects } from '../subjects'

export interface UserIsActiveOnSiteEvent {
  subject: Subjects.UserIsActiveOnSite;
  data: {
		userId: string;
		isActive: boolean;
  };
}
