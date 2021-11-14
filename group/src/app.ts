import express, { Request, Response, NextFunction } from 'express'
import { apiRateLimiter, errorHandler, NotFoundError } from '@granch_web/common'
import logger from 'morgan'
import cors from 'cors'

import { routes } from './routes/routes'

const app = express()

app.set('trust proxy', true)

app.use(cors({ origin: process.env.REACT_APP_URL }))

app.use(express.json())
app.use(logger('dev'))

app.use('/groups', routes)

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
	throw new NotFoundError()
})

app.use(errorHandler)

export { app }