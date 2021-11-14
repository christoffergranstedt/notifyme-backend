/* eslint-disable import/first */
import { ProcessesEvent } from '@granch_web/common'
import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'
import http from 'http'

import { app } from './app'
import { mongooseDB } from './config/mongoose'
import { nats } from './config/natsStreaming'
import { websocket } from './config/websocket'

let server: any

const startServer = async () => {
	let httpServer

  try {
		httpServer = http.createServer(app)
		websocket.connect(httpServer)
		await nats.connect()
		mongooseDB.connect()
		
  } catch (err) {
    console.error(err)
  }

	if (!httpServer) return
	server = httpServer.listen(3000, () => {
		console.log(`Listening on port 3000!!`)
	})
}

export const closeServer = async (errorMessage: string) => {
	nats.close()
	mongooseDB.close()
	console.log('Server is shutting down..')
	console.log(errorMessage)
	if (server) server.close()
	process.exit(1)
}

startServer()
process.on(ProcessesEvent.Terminated, closeServer);
process.on(ProcessesEvent.TerminatedByUser, closeServer);