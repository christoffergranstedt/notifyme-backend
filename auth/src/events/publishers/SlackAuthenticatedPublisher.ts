import { SlackAuthenticatedEvent, Publisher, Subjects } from "@granch_web/common"

export class SlackAuthenticatedPublisher extends Publisher<SlackAuthenticatedEvent> {
  subject: Subjects.SlackAuthenticated = Subjects.SlackAuthenticated
}