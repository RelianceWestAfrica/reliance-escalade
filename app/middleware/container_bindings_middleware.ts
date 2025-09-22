import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ContainerBindingsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Register HTTP context with the container. This allows
     * other parts of the application to access the HTTP
     * context when needed.
     */
    ctx.containerResolver.bindValue(HttpContext, ctx)
    return next()
  }
}