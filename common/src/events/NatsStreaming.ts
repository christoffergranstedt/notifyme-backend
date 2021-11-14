import nats, { Stan } from 'node-nats-streaming'
import { NatsOption } from './NatsOption';

interface ConnectAttributes {
	clusterId: string;
	clientId: string;
	url: string
}

class NatsStreaming {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client connecting')
    }

    return this._client;
  }

  connect({ clusterId, clientId, url }: ConnectAttributes ) : Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url })

    return new Promise((resolve, reject) => {
      this.client.on(NatsOption.Connect, () => {
        console.log('Connected to NATS')
        resolve()
      })
      this.client.on(NatsOption.Error, (err) => {
        reject(err)
      })
    })
  }

	close() {
		this.client.close()
	}
}

export const natsStreaming = new NatsStreaming()