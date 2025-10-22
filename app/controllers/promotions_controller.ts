import type { HttpContext } from '@adonisjs/core/http'
import Promotion from '#models/promotion'
import Employee from '#models/employee'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class PromotionsController {
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

    const promotions = await Promotion.query()
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const totalPromotions = await Promotion.query()
      .where('rwa_country_id', rwaCountryId)
      .where('statut', true)
      .count('* as total')


    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('promotions/index', {
      npromotion: {
        totalPromotions: totalPromotions[0].$extras.total,
      },
      promotions,
      currentDate,
      instanceCountry
    })
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

    const employees = await Employee.query()
      .where('rwa_country_id', rwaCountryId)
      .where('actif', true)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('promotions/create', { employees, instanceCountry })
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
    const promotion = await Promotion.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()
    await promotion.load('employee')
    const employees = await Employee.query().where('actif', true)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('promotions/edit', { promotion, employees, instanceCountry })
  }

  async show({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }
    const promotion = await Promotion.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()
    await promotion.load('employee')

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('promotions/show', { promotion, instanceCountry })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const data = request.only([
      'employee_id',
      'ancien_poste',
      'nouveau_poste',
      'ancien_salaire',
      'nouveau_salaire',
      'date_vigueur',
      'montant_augmentation',

    ])

    // recalculer proprement avant création
    data.montant_augmentation = data.nouveau_salaire - data.ancien_salaire

    await Promotion.create({
      ...data,
      userId: user.id,
      rwaCountryId,
    })

    session.flash('success', 'Promotion programmée avec succès')
    return response.redirect('/promotions')
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const promotion = await Promotion.query()
      .where('rwa_country_id', rwaCountryId)
      .where('id', params.id)
      .firstOrFail()

    const data = request.only([
      'employee_id',
      'ancien_poste',
      'nouveau_poste',
      'ancien_salaire',
      'nouveau_salaire',
      'date_vigueur',
      'montant_augmentation',

    ])

    data.montant_augmentation = data.nouveau_salaire - data.ancien_salaire

    promotion.merge({
      ...data,
      userId: user.id,
      rwaCountryId,
    })

    await promotion.save()

    session.flash('success', 'Promotion modifiée avec succès')
    return response.redirect('/promotions')
  }

}
