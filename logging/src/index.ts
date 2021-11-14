/* eslint-disable import/first */
import { ProcessesEvent } from '@granch_web/common'
import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'

import { app } from './app'
import { mongooseDB } from './config/mongoose'
import { nats } from './config/natsStreaming'

let server: any

const startServer = async () => {
  try {
		await mongooseDB.connect()
		await nats.connect()
  } catch (err) {
    console.error(err.message)
  }

	server = app.listen(3000, () => {
		console.log(`Listening on port 3000!!`)
	})
}

export const closeServer = async (errorMessage: string) => {
	mongooseDB.close()
	nats.close()
	console.log('Server is shutting down..')
	console.log(errorMessage)
	if (server) server.close()
	process.exit(1)
}

startServer()
process.on(ProcessesEvent.Terminated, closeServer);
process.on(ProcessesEvent.TerminatedByUser, closeServer);