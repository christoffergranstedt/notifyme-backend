import { EventUserReadyEvent, Publisher, Subjects } from '@granch_web/common'

export class EventUserReadyPublisher extends Publisher<EventUserReadyEvent> {
  subject: Subjects.UserReadyEvent = Subjects.UserReadyEvent
}
