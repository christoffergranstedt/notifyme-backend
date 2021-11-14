import { Listener, NatsOption, NewErrorEvent, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { Log } from '../../models/logs';
import { queueGroupName } from './queueGroupName'

export class NewErrorListener extends Listener<NewErrorEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.NewError = Subjects.NewError 

  async onMessage(data: NewErrorEvent[NatsOption.Data], msg: Message) {
		try {
			await Log.build(data)
			msg.ack()
		} catch (error) {
			console.log('Log error, user already exist')
		}
  }
}