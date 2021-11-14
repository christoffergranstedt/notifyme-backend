import express from 'express'
import { eventsRoutes } from './event.routes'

const router = express.Router()

router.use('/', eventsRoutes)

export { router as routes }