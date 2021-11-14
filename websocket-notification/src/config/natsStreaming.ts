import { NatsOption, natsStreaming } from '@granch_web/common'
import { closeServer } from '..'
import { EventUserReadyListener } from '../events/listeners/EventUserReadyListener'
import { NewErrorPublisher } from '../events/publishers/NewErrorPublisher'
import { UserIsActiveOnSitePublisher } from '../events/publishers/UserIsActiveOnSitePublisher'

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
}

const initializePublishers = () => {
	newErrorPublisher = new NewErrorPublisher(natsStreaming.client)
	userIsActiveOnSitePublisher = new UserIsActiveOnSitePublisher(natsStreaming.client)
}

const close = () => {
	try {
		natsStreaming.client.close()
	} catch (error) {
		console.log('Error while closing nats streaming')
	}

}

export let userIsActiveOnSitePublisher: UserIsActiveOnSitePublisher
export let newErrorPublisher: NewErrorPublisher
export const nats = { connect, close, initializeListeners, initializePublishers }