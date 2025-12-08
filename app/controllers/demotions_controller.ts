import type { HttpContext } from '@adonisjs/core/http'
import Demotion from '#models/demotion'
import Employee from '#models/employee'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class DemotionsController {
  async index({ view, request, session, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId2 = user.rwaCountryId

    if (!rwaCountryId2) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }
    const page = request.input('page', 1)
    const limit = 10

    const rwaCountryId = session.get('rwa_country_id')

    const demotions = await Demotion.query()
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const totalDemotions = await Demotion.query()
      .where('rwa_country_id', rwaCountryId)
      .where('statut', true)
      .count('* as total')
      .orderBy('created_at', 'desc')

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId2)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('demotions/index', {
      ndemotion: {
        totalDemotions: totalDemotions[0].$extras.total,

      }, demotions, currentDate, instanceCountry })
  }

  async create({ view, session, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId2 = user.rwaCountryId

    if (!rwaCountryId2) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }
    const rwaCountryId = session.get('rwa_country_id')
    const employees = await Employee.query().where('actif', true).where('rwa_country_id', rwaCountryId)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId2)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('demotions/create', { employees, instanceCountry })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Utilisateur non authentifié' })
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const data = request.only([
      'employee_id', 'ancien_poste', 'nouveau_poste',
      'ancien_salaire', 'nouveau_salaire', 'motif_demotion', 'date_vigueur', 'montant_reduction', 'statut'
    ])

    data.montant_reduction = data.ancien_salaire - data.nouveau_salaire

    await Demotion.create({
      ...data,
      rwaCountryId,
      userId: user.id,
    })

    session.flash('success', 'Démotion programmée avec succès')
    return response.redirect('/demotions')
  }

  async edit({ params, view, session, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId2 = user.rwaCountryId

    if (!rwaCountryId2) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }
    const rwaCountryId = session.get('rwa_country_id')
    const demotion = await Demotion.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .firstOrFail()

    const employees = await Employee.query().where('actif', true).where('rwa_country_id', rwaCountryId)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId2)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('demotions/edit', { demotion, employees, instanceCountry })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Utilisateur non authentifié' })
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const demotion = await Demotion.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only([
      'employee_id', 'ancien_poste', 'nouveau_poste',
      'ancien_salaire', 'nouveau_salaire', 'motif_demotion', 'date_vigueur', 'montant_reduction', 'statut'
    ])

    data.montant_reduction = data.ancien_salaire - data.nouveau_salaire
    demotion.merge({
      ...data,
      rwaCountryId,
      userId: user.id,
    })
    await demotion.save()

    session.flash('success', 'Démotion modifiée avec succès')
    return response.redirect('/demotions')
  }

  async apply({ params, response, session, auth }: HttpContext) {
    const rwaCountryId = session.get('rwa_country_id')
    const userId = auth.user?.id

    const demotion = await Demotion.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .firstOrFail()

    // Appliquer la démotion
    demotion.statut = 'Appliquée'
    demotion.userId = userId ?? null
    await demotion.save()

    // Mettre à jour l'employé
    const employee = demotion.employee
    employee.poste = demotion.nouveauPoste
    employee.salaire = demotion.nouveauSalaire
    await employee.save()

    session.flash('success', 'Démotion appliquée avec succès')
    return response.redirect('/demotions')
  }

  async destroy({ params, response, session }: HttpContext) {
    const rwaCountryId = session.get('rwa_country_id')

    const demotion = await Demotion.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await demotion.delete()

    session.flash('success', 'Démotion supprimée avec succès')
    return response.redirect('/demotions')
  }

  async show({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Utilisateur non authentifié' })
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    const demotion = await Demotion.findOrFail(params.id)
    await demotion.load('employee')

    return view.render('demotions/show', { demotion, instanceCountry })
  }
}
