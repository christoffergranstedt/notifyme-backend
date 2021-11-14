import { EventUserReadyEvent, HTTPMethod, Listener, NatsOption, SlackAuthenticatedEvent, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { User } from '../../models/user';
import { queueGroupName } from './queueGroupName'

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
				await User.addEventToUser(data.users[i].userId, eventToSend)
			}

			msg.ack()
		} catch (error) {
			console.log('Event could not be published to Slack')
			msg.ack()
		}
  }
}