import express from 'express'

import { accountsController } from '../controllers/account.controllers'
import { validateInput, responseHandler, verifyAccessToken } from '@granch_web/common'
import { validateUserInput } from '../middlewares/validate'

const router = express.Router()

// Routes for the Account resoruces
router.get('/', verifyAccessToken, validateUserInput, accountsController.getCurrentUser, responseHandler)
router.post('/authenticate', validateUserInput, validateInput, accountsController.authenticateUser, responseHandler)
router.post('/refresh', accountsController.refreshAccessToken, responseHandler)
router.post('/register', validateUserInput, validateInput, accountsController.registerUser, responseHandler)
router.get('/signout', verifyAccessToken, accountsController.signoutUser, responseHandler)

export { router as accountsRoutes }