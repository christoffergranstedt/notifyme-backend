import { UnauthenticatedError } from "@granch_web/common"
import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'

interface WebSocket {
	io: any,
	connect: any,
	notifyUser: any
}

interface UserPayload {
  id: string;
  username: string;
}

export let websocket: WebSocket = {
	io: null,
	connect: null,
	notifyUser: null
}

websocket.connect = (server: any) => {
	websocket.io = new Server(server, {
		cors: {
			origin: process.env.REACT_APP_URL,
			credentials: true
		}
	})


	websocket.io.on('connection', async (socket: Socket) => {
		console.log('Connected to websocket')

		socket.on('join', (data: { accessToken: string }) => {
			console.log('JOINING')
			try {
				const { ACCESS_TOKEN_SECRET } = process.env
				if (!ACCESS_TOKEN_SECRET) {
					throw new Error('An access token secret need to be provided')
				}

				const accessToken = data.accessToken
				if (!accessToken) throw new UnauthenticatedError()

				const tokenPayload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as UserPayload
				console.log('tokenpayload')
				console.log(tokenPayload)
				socket.join(tokenPayload.id)
			} catch (error) {
				throw new UnauthenticatedError()
			}			
		})
		
		socket.on("disconnect", async (socket: any) => {
			console.log(socket)
			// if(socket.rooms.indexOf(room) >= 0)
		})
	})
}

websocket.notifyUser = (userId: string, event: any) => {
	websocket.io.in(userId).emit('event', event)
} 
