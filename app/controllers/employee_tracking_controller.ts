import type { HttpContext } from '@adonisjs/core/http'
import EmployeeTracking from '#models/employee_tracking'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

export default class EmployeeTrackingController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 20
    const dateFilter = request.input('date')
    const employeeFilter = request.input('employee_id')

    let query = EmployeeTracking.query()
      .preload('employee')
      .orderBy('date_heure', 'desc')

    // if (dateFilter) {
    //   query = query.whereRaw('DATE(date_heure) = ?', [dateFilter])
    // }

    if (dateFilter) {
      query = query.whereRaw('DATE(date_heure) = ?', dateFilter)
    }

    if (employeeFilter) {
      query = query.where('employee_id', employeeFilter)
    }

    const trackings = await query.paginate(page, limit)
    const employees = await Employee.query().where('actif', true).orderBy('nom')

    const totalEmployees = await Employee.query().count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('tracking/index', {
      nemployee: {
        totalEmployees: totalEmployees[0].$extras.total,

      }, trackings, employees, dateFilter, employeeFilter, currentDate })
  }

  async create({ view }: HttpContext) {
    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const employees = await Employee.query().where('actif', true).orderBy('nom')
    return view.render('tracking/create', { employees, currentDate })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['employee_id', 'type_evenement', 'date_heure', 'commentaire', 'lieu'])

    await EmployeeTracking.create(data)

    session.flash('success', 'Événement de suivi enregistré avec succès')
    return response.redirect('/tracking')
  }

  async edit({ params, view }: HttpContext) {
    const tracking = await EmployeeTracking.findOrFail(params.id)
    await tracking.load('employee')
    const employees = await Employee.query().where('actif', true).orderBy('nom')

    return view.render('tracking/edit', { tracking, employees })
  }

  async update({ params, request, response, session }: HttpContext) {
    const tracking = await EmployeeTracking.findOrFail(params.id)
    const data = request.only(['employee_id', 'type_evenement', 'date_heure', 'commentaire', 'lieu', 'statut'])

    tracking.merge(data)
    await tracking.save()

    session.flash('success', 'Événement de suivi modifié avec succès')
    return response.redirect('/tracking')
  }

  async destroy({ params, response, session }: HttpContext) {
    const tracking = await EmployeeTracking.findOrFail(params.id)
    await tracking.delete()

    session.flash('success', 'Événement de suivi supprimé avec succès')
    return response.redirect('/tracking')
  }

  async dashboard({ view }: HttpContext) {
    const today = DateTime.now().toISODate()

    // Présences du jour
    const todayPresence = await EmployeeTracking.query()
      .preload('employee')
      .whereRaw('DATE(date_heure) = ?', [today])
      .where('type_evenement', 'Arrivée')
      .orderBy('date_heure', 'desc')

    // Absences du jour
    const todayAbsences = await EmployeeTracking.query()
      .preload('employee')
      .whereRaw('DATE(date_heure) = ?', [today])
      .whereIn('type_evenement', ['Congé', 'Maladie'])

    // Statistiques de la semaine
    const weekStart = DateTime.now().startOf('week').toISODate()
    const weekEnd = DateTime.now().endOf('week').toISODate()

    const weekStats = await EmployeeTracking.query()
      .select('type_evenement')
      .count('* as count')
      .whereBetween('date_heure', [weekStart, weekEnd])
      .groupBy('type_evenement')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")


    return view.render('tracking/dashboard', {
      todayPresence,
      todayAbsences,
      weekStats,
      today,
      currentDate
    })
  }
}
