import { EventUserReadyEvent, HTTPMethod, Listener, NatsOption, SlackAuthenticatedEvent, Subjects } from '@granch_web/common'
import { Message } from 'node-nats-streaming'
import { UserNotification } from '../../models/userNotification';
import { queueGroupName } from './queueGroupName'
import axios from 'axios'

export class EventUserReadyListener extends Listener<EventUserReadyEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.UserReadyEvent = Subjects.UserReadyEvent 

  async onMessage(data: EventUserReadyEvent[NatsOption.Data], msg: Message) {
		try {
			const eventToSend = `
			Event of type ${data.eventType} has been triggered in group ${data.groupId}. This event is for project ${data.projectId} (${data.projectUrl}).
			Author: ${data.author}
			Name: ${data.name}
			Description: ${data.description}
			Date: ${new Date()}
			${data.action ? `Action: ${data.action}` : ''}
			`

			console.log(data)

			for (let i = 0; i < data.users.length; i++) {
				const user = await UserNotification.getCurrentUser(data.users[i].userId)
				await axios({
					url: user.accessURL,
					method: HTTPMethod.POST,
					data: {
						text: eventToSend
					}
				})
			}

			msg.ack()
		} catch (error) {
			console.log('Event could not be published to Slack')
			msg.ack()
		}
  }
}