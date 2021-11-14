import { Listener, NatsOption, Subjects, UserCreatedEvent } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { User } from '../../models/user';
import { queueGroupName } from './queueGroupName'

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.UserCreated = Subjects.UserCreated 

  async onMessage(data: UserCreatedEvent[NatsOption.Data], msg: Message) {
		try { 
			console.log('User created received')
			await User.build({ userId: data.userId })
			msg.ack()
		} catch (error) {
			console.log('Log error, user already exist')
		}
  }
}