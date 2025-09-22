import type { HttpContext } from '@adonisjs/core/http'
// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


export default class ShareViewGlobals {
  public async handle({ view, auth, request, session }: HttpContext, next: () => Promise<void>) {
    view.share({
      auth: {
        user: auth.user,
      },
      request,
      requestUrl: request.url(),
      flashMessages: session.flashMessages,
    })

    await next()
  }
}
