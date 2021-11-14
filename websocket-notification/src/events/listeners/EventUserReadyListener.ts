import { EventUserReadyEvent, Listener, NatsOption, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queueGroupName'
import { websocket } from '../../config/websocket';

export class EventUserReadyListener extends Listener<EventUserReadyEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.UserReadyEvent = Subjects.UserReadyEvent 

  async onMessage(data: EventUserReadyEvent[NatsOption.Data], msg: Message) {
		try {
			const eventToSend = { 
				eventType: data.eventType, 
				groupId: data.groupId, 
				projectId: data.projectId,
				projectUrl: data.projectUrl,
				author: data.author, 
				authorAvatar: data.authorAvatar, 
				name: data.name, 
				description: data.description, 
				action: data.action,
				date: new Date()
			}
			for (let i = 0; i < data.users.length; i++) {
				websocket.notifyUser(data.users[i].userId, eventToSend)
			}

			msg.ack()
		} catch (error) {
			console.log('Log error, user already exist')
		}
  }
}