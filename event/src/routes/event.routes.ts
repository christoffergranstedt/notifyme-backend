import express from 'express'

import { eventsController } from '../controllers/event.controllers'
import { responseHandler, verifyAccessToken } from '@granch_web/common'
import { verifyGitlabToken } from '../middlewares/verifyGitlabToken'

const router = express.Router()

// Routes for the Groups resoruces
router.get('/ping', verifyAccessToken, eventsController.pingServer, responseHandler)
router.get('/groups/:groupId', verifyAccessToken, eventsController.getUserEvents, responseHandler)
router.post('/', verifyGitlabToken, eventsController.gitlabWebhook, responseHandler)

export { router as eventsRoutes }