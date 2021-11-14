import { Subjects } from '../subjects'

export interface NewErrorEvent {
  subject: Subjects.NewError;
  data: {
		date: Date;
		errorType: string;
		errorMessage: string;
  };
}
