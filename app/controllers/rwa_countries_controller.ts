import type { HttpContext } from '@adonisjs/core/http'
import RwaCountry from '#models/rwa_country'

export default class RwaCountriesController {
  async index({ view, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const page = request.input('page', 1)
    const limit = 10

    const countries = await RwaCountry.query()
      .withCount('users')
      .withCount('employees')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('rwa_countries/index', { countries, instanceCountry })
  }

  async create({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('rwa_countries/create', { instanceCountry })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'rwa_instance_name', 'instance_country', 'access_code', 'instance_ceo'
    ])

    // Vérifier si le code d'accès existe déjà
    const existingCountry = await RwaCountry.findBy('access_code', data.access_code)
    if (existingCountry) {
      session.flash('error', 'Ce code d\'accès est déjà utilisé')
      return response.redirect().back()
    }

    await RwaCountry.create(data)

    session.flash('success', 'Instance RWA créée avec succès')
    return response.redirect('/rwa-countries')
  }

  async show({ params, view , auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }
    const country = await RwaCountry.findOrFail(params.id)
    await country.load('users')
    await country.load('employees')

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('rwa_countries/show', { country, instanceCountry })
  }

  async edit({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }
    const country = await RwaCountry.findOrFail(params.id)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('rwa_countries/edit', { country, instanceCountry })
  }

  async update({ params, request, response, session }: HttpContext) {
    const country = await RwaCountry.findOrFail(params.id)
    const data = request.only([
      'rwa_instance_name', 'instance_country', 'access_code', 'instance_ceo', 'actif'
    ])

    // Vérifier si le code d'accès existe déjà (sauf pour le pays actuel)
    if (data.access_code !== country.accessCode) {
      const existingCountry = await RwaCountry.findBy('access_code', data.access_code)
      if (existingCountry) {
        session.flash('error', 'Ce code d\'accès est déjà utilisé')
        return response.redirect().back()
      }
    }

    country.merge(data)
    await country.save()

    session.flash('success', 'Instance RWA modifiée avec succès')
    return response.redirect('/rwa-countries')
  }

  async destroy({ params, response, session }: HttpContext) {
    const country = await RwaCountry.findOrFail(params.id)

    // Vérifier s'il y a des utilisateurs ou employés liés
    await country.load('users')
    await country.load('employees')

    if (country.users.length > 0 || country.employees.length > 0) {
      session.flash('error', 'Impossible de supprimer une instance avec des utilisateurs ou employés')
      return response.redirect().back()
    }

    await country.delete()

    session.flash('success', 'Instance RWA supprimée avec succès')
    return response.redirect('/rwa-countries')
  }

  async toggleStatus({ params, response, session }: HttpContext) {
    const country = await RwaCountry.findOrFail(params.id)
    country.actif = !country.actif
    await country.save()

    session.flash('success', `Instance ${country.actif ? 'activée' : 'désactivée'} avec succès`)
    return response.redirect('/rwa-countries')
  }
}
