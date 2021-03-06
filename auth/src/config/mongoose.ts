import mongoose from 'mongoose'
import { closeServer } from '../index';

const connect = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
  mongoose.connection.on('connected', () => console.log('Connected to MongoDB database.'))
  mongoose.connection.on('disconnected', () => closeServer('Mongo DB is disconnected'))
  mongoose.connection.on('error', error => closeServer(error.message))

	mongoose.connect(process.env.MONGO_URI, { socketTimeoutMS: 10000 })
}

const close = () => {
	try {
		mongoose.connection.close(() => {
			console.log('Mongoose connection is disconnected due to application termination.')
		})
	} catch (error) {
		console.log('Error when closing mongoose')
	}

}

export const mongooseDB = { connect, close }
