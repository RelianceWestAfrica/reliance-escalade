import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ForceJsonResponseMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    /**
     * Force JSON response for API routes
     */
    if (request.url().startsWith('/api/')) {
      request.request.headers.accept = 'application/json'
    }

    return next()
  }
}