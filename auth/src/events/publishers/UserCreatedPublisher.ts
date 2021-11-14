import { GitlabAuthenticatedEvent, Publisher, Subjects, UserCreatedEvent } from "@granch_web/common"

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated
}