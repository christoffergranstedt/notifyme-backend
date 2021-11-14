import { Publisher, Subjects, GitlabAuthenticatedEvent } from "@granch_web/common"

export class GitlabAuthenticatedPublisher extends Publisher<GitlabAuthenticatedEvent> {
  subject: Subjects.GitlabAuthenticated = Subjects.GitlabAuthenticated
}