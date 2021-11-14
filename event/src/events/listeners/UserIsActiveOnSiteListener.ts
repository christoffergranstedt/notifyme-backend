import { Listener, NatsOption, Subjects, UserCreatedEvent, UserIsActiveOnSiteEvent } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { User } from '../../models/user';
import { queueGroupName } from './queueGroupName'

export class UserIsActiveOnSiteListener extends Listener<UserIsActiveOnSiteEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.UserIsActiveOnSite = Subjects.UserIsActiveOnSite 

  async onMessage(data: UserIsActiveOnSiteEvent[NatsOption.Data], msg: Message) {
		try { 
			console.log('User is active on site event')
			await User.updateLastActiveOnSite({ userId: data.userId, isActive: data.isActive, lastActiveOnSite: new Date() })
			msg.ack()
		} catch (error) {
			console.log('Log error, user already exist')
		}
  }
}