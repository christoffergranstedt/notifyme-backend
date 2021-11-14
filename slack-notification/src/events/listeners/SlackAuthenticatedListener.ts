import { Listener, NatsOption, SlackAuthenticatedEvent, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { UserNotification } from '../../models/userNotification';
import { queueGroupName } from './queueGroupName'

export class SlackAuthenticatedListener extends Listener<SlackAuthenticatedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.SlackAuthenticated = Subjects.SlackAuthenticated 

  async onMessage(data: SlackAuthenticatedEvent[NatsOption.Data], msg: Message) {
		try {
			await UserNotification.build(data)
			msg.ack()
		} catch (error) {
			console.log('Log error, user already exist')
			msg.ack()
		}
  }
}