import NodeCache from 'node-cache'
import { Request, Response, NextFunction } from 'express'

const cacheStoredInSeconds = 24 * 60 * 60
const cache = new NodeCache({ stdTTL: cacheStoredInSeconds })

/**
 * To set a cache for the domain and eventual specific resource
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {object} - Returns next to go next middleware
 */
export const setCache = (req: Request, res: Response, next: NextFunction) => {
	const url = `${req.headers.host}${req.originalUrl}`
	cache.set(url, res.locals.data)
	return next()
}

/**
 * To get the cache for the domain and eventual specific resource
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {object} - Returns next to go next middleware
 */
export const getCache = (req: Request, res: Response, next: NextFunction) => {
	const url = `${req.headers.host}${req.originalUrl}`
	const content = cache.get(url)
	if (!content) return next()

	return res.status(200).json(content)
}

/**
 * Invalidate the cache that is set on the resource
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {object} - Returns next to go next middleware
 */
export const invalidateCache = async (req: Request, res: Response, next: NextFunction) => {
	const cacheKeys = await cache.keys()

	const baseUrl = req.headers.host
	const resourcesUrl = req.baseUrl
	const storesUrl = `${baseUrl}${resourcesUrl}`

	const resourceskeys = cacheKeys.filter(key => key === storesUrl)
	cache.del(resourceskeys)
	return next()
}
