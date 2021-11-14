import { Stan } from 'node-nats-streaming'
import { NatsOption } from './NatsOption'
import { Subjects } from './subjects'

interface Event {
  subject: Subjects
  data: any
}

export abstract class Publisher<T extends Event> {
  abstract subject: T[NatsOption.Subject]
  protected client: Stan

  constructor(client: Stan) {
    this.client = client
  }

  publish(data: T[NatsOption.Data]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
}
