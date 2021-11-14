import { NewErrorEvent, Publisher, Subjects, UserIsActiveOnSiteEvent } from '@granch_web/common'

export class UserIsActiveOnSitePublisher extends Publisher<UserIsActiveOnSiteEvent> {
  subject: Subjects.UserIsActiveOnSite = Subjects.UserIsActiveOnSite
}
