import { NatsOption, natsStreaming } from '@granch_web/common'
import { closeServer } from '..'
import { NewErrorListener } from '../events/listeners/NewErrorListener'

const connect = async () => {
	const { NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL } = process.env
	  if (!NATS_CLIENT_ID || !NATS_URL || !NATS_CLUSTER_ID) {
		closeServer('NATS_CLIENT_ID and NATS_URL and NATS_CLUSTER_ID must be defined')
		throw new Error()
  }

	await natsStreaming.connect({ clusterId: NATS_CLUSTER_ID, clientId: NATS_CLIENT_ID, url: NATS_URL })
	initializeListeners()

	natsStreaming.client.on(NatsOption.Close, () => {
		closeServer('NATS connection is closed')
	})
}

const initializeListeners = () => {
	new NewErrorListener(natsStreaming.client).listen()
}

const close = () => {
	try {
		natsStreaming.client.close()
	} catch (error) {
		console.log('Error while closing nats streaming')
	}

}

export const nats = { connect, close }