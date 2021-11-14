import express, { Request, Response, NextFunction } from 'express'
import { apiRateLimiter, errorHandler, NotFoundError } from '@granch_web/common'
import logger from 'morgan'
import cors from 'cors'


const app = express()

app.set('trust proxy', true)
app.use(cors({ origin: process.env.REACT_APP_URL }))
app.use(logger('dev'))
app.use(apiRateLimiter)

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
	throw new NotFoundError()
})

app.use(errorHandler)

export { app }