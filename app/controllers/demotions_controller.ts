import type { HttpContext } from '@adonisjs/core/http'
import Demotion from '#models/demotion'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

export default class DemotionsController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10

    const demotions = await Demotion.query()
      .preload('employee')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const totalDemotions = await Demotion.query()
      .count('* as total')
      .where('statut', true)
      .orderBy('created_at', 'desc')

    return view.render('demotions/index', {
      ndemotion: {
        totalDemotions: totalDemotions[0].$extras.total,

      }, demotions, currentDate })
  }

  async create({ view }: HttpContext) {
    const employees = await Employee.query().where('actif', true)
    return view.render('demotions/create', { employees })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'employee_id', 'ancien_poste', 'nouveau_poste',
      'ancien_salaire', 'nouveau_salaire', 'motif_demotion', 'date_vigueur', 'montant_reduction'
    ])

    data.montant_reduction = data.ancien_salaire - data.nouveau_salaire

    await Demotion.create(data)

    session.flash('success', 'Démotion programmée avec succès')
    return response.redirect('/demotions')
  }

  async edit({ params, view }: HttpContext) {
    const demotion = await Demotion.findOrFail(params.id)
    await demotion.load('employee')
    const employees = await Employee.query().where('actif', true)

    return view.render('demotions/edit', { demotion, employees })
  }

  async update({ params, request, response, session }: HttpContext) {
    const demotion = await Demotion.findOrFail(params.id)
    const data = request.only([
      'employee_id', 'ancien_poste', 'nouveau_poste',
      'ancien_salaire', 'nouveau_salaire', 'motif_demotion', 'date_vigueur', 'montant_reduction',
    ])

    data.montant_reduction = data.ancien_salaire - data.nouveau_salaire
    demotion.merge(data)
    await demotion.save()

    session.flash('success', 'Démotion modifiée avec succès')
    return response.redirect('/demotions')
  }

  async apply({ params, response, session }: HttpContext) {
    const demotion = await Demotion.findOrFail(params.id)
    await demotion.load('employee')

    // Appliquer la démotion
    demotion.statut = 'Appliquée'
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
    const demotion = await Demotion.findOrFail(params.id)
    await demotion.delete()

    session.flash('success', 'Démotion supprimée avec succès')
    return response.redirect('/demotions')
  }
}
