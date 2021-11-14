import express from 'express'
import { groupsRoutes } from './groups.routes'

const router = express.Router()

router.use('/', groupsRoutes)

export { router as routes }