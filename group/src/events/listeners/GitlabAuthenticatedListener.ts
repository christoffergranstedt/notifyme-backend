import { GitlabAuthenticatedEvent, Listener, NatsOption, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { UserNotification } from '../../models/userNotification';
import { queueGroupName } from './queueGroupName'

export class GitlabAuthenticatedListener extends Listener<GitlabAuthenticatedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.GitlabAuthenticated = Subjects.GitlabAuthenticated 

  async onMessage(data: GitlabAuthenticatedEvent[NatsOption.Data], msg: Message) {
		try { 
			console.log('Gitlab Authenticated Event Received')
			await UserNotification.build(data)
			msg.ack()
		} catch (error) {
			console.log('Log error, user already exist')
			msg.ack()
		}
  }
}