import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import RwaCountry from '#models/rwa_country'

export default class AuthController {
  async showAccessCode({ view }: HttpContext) {
    return view.render('auth/access_code')
  }

  async verifyAccess({ request, response, session }: HttpContext) {
    const access_code = request.input('access_code')

    const instance = await RwaCountry.query().where('access_code', access_code).first()

    // Étape 1 : Vérification du code d’accès d’une instance
    if (!instance) {
      session.flash('error', 'Code d\'accès invalide')
      return response.redirect().back()
    }

    // On stocke l’id de l’instance en session
    session.put('rwa_country_id', instance.id)

    // Code d'accès valide, rediriger vers la page de connexion
    return response.redirect().toRoute('auth.login')
  }

  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const email = request.input('email')
    const password = request.input('password')

    // Vérifie que le code d’accès a bien été validé avant
    const countryId = session.get('rwa_country_id')
    if (!countryId) {
      session.flash('error', 'Veuillez d’abord saisir un code d’accès valide.')
      return response.redirect().toRoute('auth.access_code')
    }

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      // Vérifie que l’utilisateur appartient à la bonne instance (pays)
      if (user.rwaCountryId !== countryId) {
        await auth.use('web').logout()
        session.flash('error', 'Vous n’êtes pas autorisé à accéder à cette instance.')
        return response.redirect().toRoute('auth.access_code')

      }

      return response.redirect('/dashboard')
    } catch {
      session.flash('error', 'Identifiants incorrects')
      return response.redirect().back()
    }
  }

  async logout({ auth, response, session}: HttpContext) {
    await auth.use('web').logout()
    session.forget('rwa_country_id')
    return response.redirect().toRoute('auth.access_code')
  }
}
