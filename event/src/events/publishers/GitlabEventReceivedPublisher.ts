import { GitlabEventReceivedEvent, Publisher, Subjects } from "@granch_web/common"

export class GitlabEventReceivedPublisher extends Publisher<GitlabEventReceivedEvent> {
  subject: Subjects.GitlabEventReceived = Subjects.GitlabEventReceived
}