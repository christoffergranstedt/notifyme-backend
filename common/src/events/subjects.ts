export enum Subjects {
  GitlabAuthenticated = 'accounts:gitlab-authenticated',
  SlackAuthenticated = 'accounts:slack-authenticated',
  UserCreated = 'accounts:user-created',
  UserProjectsFetched = 'accounts:user-projects',
	GitlabEventReceived = 'events:gitlab-event-received',
	UserReadyEvent = 'events:user-ready-event',
	NewError = 'logging:new-error',
	UserIsActiveOnSite = 'accounts:active'
}
