import { NatsOption, natsStreaming } from '@granch_web/common'
import { closeServer } from '..'
import { GitlabAuthenticatedPublisher } from '../events/publishers/GitlabAuthenticatedPublisher'
import { SlackAuthenticatedPublisher } from '../events/publishers/SlackAuthenticatedPublisher'
import { UserCreatedPublisher } from '../events/publishers/UserCreatedPublisher'

export let gitlabAuthenticatedPublisher: GitlabAuthenticatedPublisher
export let slackAuthenticatedPublisher: SlackAuthenticatedPublisher
export let userCreatedPublisher: UserCreatedPublisher

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

}

const initializePublishers = () => {
	gitlabAuthenticatedPublisher = new GitlabAuthenticatedPublisher(natsStreaming.client) 
	slackAuthenticatedPublisher = new SlackAuthenticatedPublisher(natsStreaming.client) 
	userCreatedPublisher = new UserCreatedPublisher(natsStreaming.client)
}

const close = () => {
	try {
		natsStreaming.client.close()
	} catch (error) {
		console.log('Error while closing nats streaming')
	}

}

export const nats = { connect, close, initializeListeners, initializePublishers }