import { NewErrorEvent, Publisher, Subjects } from '@granch_web/common'

export class NewErrorPublisher extends Publisher<NewErrorEvent> {
  subject: Subjects.NewError = Subjects.NewError
}
