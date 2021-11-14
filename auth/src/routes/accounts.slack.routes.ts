import express from 'express'

import { accountsSlackController } from '../controllers/account.slack.controllers'
import { responseHandler } from '@granch_web/common'
import { verifyAccessTokenInCookie } from '../middlewares/verifyTokenInCookie'

const router = express.Router()

router.get('/authenticate', verifyAccessTokenInCookie, accountsSlackController.startAuthenticate, responseHandler)
router.get('/authenticate/callback', verifyAccessTokenInCookie, accountsSlackController.authenticateCallback, responseHandler)

export { router as accountsSlackRoutes }