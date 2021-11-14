import { EventUserReadyEvent, GitlabAuthenticatedEvent, GitlabEventReceivedEvent, Listener, NatsOption, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { eventUserReadyPublisher } from '../../config/natsStreaming';
import { UserNotification } from '../../models/userNotification';
import { queueGroupName } from './queueGroupName'

export class GitlabEventReceivedListener extends Listener<GitlabEventReceivedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.GitlabEventReceived = Subjects.GitlabEventReceived 

  async onMessage(data: GitlabEventReceivedEvent[NatsOption.Data], msg: Message) {
		try { 
			console.log('Gitlab Event Received')
			const users = await UserNotification.getUsersNotificationsRequest(data.projectId)
			console.log(data)
			console.log(users)

			if (users.length > 0) {
				const userReadyEvent = { ...data, users, date: new Date() }
				eventUserReadyPublisher.publish(userReadyEvent)
			}
			msg.ack()
		} catch (error) {
			msg.ack()
			console.log('Log error, user already exist')
		}
  }
}