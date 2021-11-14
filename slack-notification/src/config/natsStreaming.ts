import { NatsOption, natsStreaming } from '@granch_web/common'
import { closeServer } from '..'
import { EventUserReadyListener } from '../events/listeners/EventUserReadyListener'
import { SlackAuthenticatedListener } from '../events/listeners/SlackAuthenticatedListener'
import { NewErrorPublisher } from '../events/publishers/NewErrorPublisher'

const connect = async () => {
	const { NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL } = process.env
	  if (!NATS_CLIENT_ID || !NATS_URL || !NATS_CLUSTER_ID) {
		closeServer('NATS_CLIENT_ID and NATS_URL and NATS_CLUSTER_ID must be defined')
		throw new Error()
  }

	await natsStreaming.connect({ clusterId: NATS_CLUSTER_ID, clientId: NATS_CLIENT_ID, url: NATS_URL })
	initializeListeners()
	initializePublishers()

	natsStreaming.client.on(NatsOption.Close, () => {
		closeServer('NATS connection is closed')
	})
}

const initializeListeners = () => {
	new EventUserReadyListener(natsStreaming.client).listen()
	new SlackAuthenticatedListener(natsStreaming.client).listen()
}

const initializePublishers = () => {
	newErrorPublisher = new NewErrorPublisher(natsStreaming.client)
}

const close = () => {
	try {
		natsStreaming.client.close()
	} catch (error) {
		console.log('Error while closing nats streaming')
	}

}

export let newErrorPublisher: NewErrorPublisher
export const nats = { connect, close, initializeListeners, initializePublishers }