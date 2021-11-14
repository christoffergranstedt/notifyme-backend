import express from 'express'
import { accountsRoutes } from './accounts.routes'
import { accountsGitlabRoutes } from './accounts.gitlab.routes'
import { accountsSlackRoutes } from './accounts.slack.routes'

const router = express.Router()

// Main routes for different resources
router.use('/gitlab', accountsGitlabRoutes)
router.use('/slack', accountsSlackRoutes)
router.use('/', accountsRoutes)

export { router as routes }