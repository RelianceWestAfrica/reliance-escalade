import type { HttpContext } from '@adonisjs/core/http'
import Promotion from '#models/promotion'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

export default class PromotionsController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10

    const promotions = await Promotion.query()
      .preload('employee')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const totalPromotions = await Promotion.query()
      .count('* as total')
      .where('statut', true)
      .orderBy('created_at', 'desc')

    return view.render('promotions/index', {
      npromotion: {
        totalPromotions: totalPromotions[0].$extras.total,

      }, promotions, currentDate })
  }

  async create({ view }: HttpContext) {
    const employees = await Employee.query().where('actif', true)
    return view.render('promotions/create', { employees })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'employee_id', 'ancien_poste', 'nouveau_poste',
      'ancien_salaire', 'nouveau_salaire', 'date_vigueur', 'montant_augmentation'
    ])

    data.montant_augmentation = data.nouveau_salaire - data.ancien_salaire

    await Promotion.create(data)

    session.flash('success', 'Promotion programmée avec succès')
    return response.redirect('/promotions')
  }

  async edit({ params, view }: HttpContext) {
    const promotion = await Promotion.findOrFail(params.id)
    await promotion.load('employee')
    const employees = await Employee.query().where('actif', true)

    return view.render('promotions/edit', { promotion, employees })
  }

  async update({ params, request, response, session }: HttpContext) {
    const promotion = await Promotion.findOrFail(params.id)
    const data = request.only([
      'employee_id', 'ancien_poste', 'nouveau_poste',
      'ancien_salaire', 'nouveau_salaire', 'date_vigueur', 'montant_augmentation'
    ])

    data.montant_augmentation = data.nouveau_salaire - data.ancien_salaire
    promotion.merge(data)
    await promotion.save()

    session.flash('success', 'Promotion modifiée avec succès')
    return response.redirect('/promotions')
  }

  async show({ params, view }: HttpContext) {
    const promotion = await Promotion.findOrFail(params.id)

    return view.render('promotions/show', { promotion })
  }

  async apply({ params, response, session }: HttpContext) {
    const promotion = await Promotion.findOrFail(params.id)
    await promotion.load('employee')

    // Appliquer la promotion
    promotion.statut = 'Appliquée'
    await promotion.save()

    // Mettre à jour l'employé
    const employee = promotion.employee
    employee.poste = promotion.nouveauPoste
    employee.salaire = promotion.nouveauSalaire
    await employee.save()

    session.flash('success', 'Promotion appliquée avec succès')
    return response.redirect('/promotions')
  }

  async destroy({ params, response, session }: HttpContext) {
    const promotion = await Promotion.findOrFail(params.id)
    await promotion.delete()

    session.flash('success', 'Promotion supprimée avec succès')
    return response.redirect('/promotions')
  }
}
