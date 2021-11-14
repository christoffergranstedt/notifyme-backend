import express from 'express'

import { groupsController } from '../controllers/group.controllers'
import { responseHandler, verifyAccessToken } from '@granch_web/common'

const router = express.Router()

// Routes for the Groups resoruces
router.get('/', verifyAccessToken, groupsController.getUserGroups, responseHandler)
router.get('/:groupId/projects', verifyAccessToken, groupsController.getProjectsInGroup, responseHandler)
router.put('/:groupId/projects/:projectId', verifyAccessToken, groupsController.updateNotificationSettings, responseHandler)

export { router as groupsRoutes }