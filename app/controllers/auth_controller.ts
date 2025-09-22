import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async showAccessCode({ view }: HttpContext) {
    return view.render('auth/access_code')
  }

  async verifyAccess({ request, response, session }: HttpContext) {
    const { access_code } = request.only(['access_code'])

    if (access_code !== 'RELIANCE2025') {
      session.flash('error', 'Code d\'accès invalide')
      return response.redirect().back()
    }

    // Code d'accès valide, rediriger vers la page de connexion
    return response.redirect().toRoute('auth.login')
  }

  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      
      return response.redirect('/dashboard')
    } catch {
      session.flash('error', 'Identifiants incorrects')
      return response.redirect().back()
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('auth.access_code')
  }
}