import express from 'express'

import { accountsGitlabController } from '../controllers/account.gitlab.controllers'
import { responseHandler } from '@granch_web/common'
import { verifyAccessTokenInCookie } from '../middlewares/verifyTokenInCookie'

const router = express.Router()

router.get('/authenticate', verifyAccessTokenInCookie, accountsGitlabController.startAuthenticate, responseHandler)
router.get('/authenticate/callback', verifyAccessTokenInCookie, accountsGitlabController.authenticateCallback, responseHandler)

export { router as accountsGitlabRoutes }