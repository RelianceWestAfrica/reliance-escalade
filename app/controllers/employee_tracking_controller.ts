import type { HttpContext } from '@adonisjs/core/http'
import EmployeeTracking from '#models/employee_tracking'
import Employee from '#models/employee'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class EmployeeTrackingController {
  async index({ view, request, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return view.render('errors/unauthorized')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun pays d\'instance RWA n\'a été trouvéé rattachée à cet utilisateur.')
    }

    const page = request.input('page', 1)
    const limit = 20
    const dateFilter = request.input('date')
    const employeeFilter = request.input('employee_id')

    let query = EmployeeTracking.query()
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .orderBy('date_heure', 'desc')

    if (dateFilter) {
      query = query.whereRaw('DATE(date_heure) = ?', [dateFilter])
    }

    if (employeeFilter) {
      query = query.where('employee_id', employeeFilter)
    }

    const trackings = await query.paginate(page, limit)

    const employees = await Employee.query()
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .orderBy('nom')

    const totalEmployees = await Employee.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('tracking/index', {
      nemployee: {
        totalEmployees: totalEmployees[0].$extras.total,
      },
      trackings,
      employees,
      dateFilter,
      employeeFilter,
      currentDate,
      instanceCountry
    })
  }

  async create({ view, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return view.render('errors/unauthorized')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")
    const employees = await Employee.query()
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .orderBy('nom')

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('tracking/create', { employees, currentDate,instanceCountry })
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

    const data = request.only(['employee_id', 'type_evenement', 'date_heure', 'commentaire', 'lieu', ])
    await EmployeeTracking.create({
      ...data,
      rwaCountryId,
      userId: user.id,
    })

    session.flash('success', 'Événement de suivi enregistré avec succès')
    return response.redirect('/tracking')
  }

  async edit({ params, view, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return view.render('errors/unauthorized')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const tracking = await EmployeeTracking.query()
      .where('id', params.id)
      .andWhere('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await tracking.load('employee')

    const employees = await Employee.query()
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .orderBy('nom')

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('tracking/edit', { tracking, employees, instanceCountry })
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

    const tracking = await EmployeeTracking.query()
      .where('id', params.id)
      .andWhere('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only(['employee_id', 'type_evenement', 'date_heure', 'commentaire', 'lieu', 'statut', ])

    tracking.merge({
      ...data,
      rwaCountryId,
      userId: user.id,
    })
    await tracking.save()

    session.flash('success', 'Événement de suivi modifié avec succès')
    return response.redirect('/tracking')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Utilisateur non authentifié' })
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const tracking = await EmployeeTracking.query()
      .where('id', params.id)
      .andWhere('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await tracking.delete()

    session.flash('success', 'Événement de suivi supprimé avec succès')
    return response.redirect('/tracking')
  }

  async dashboard({ view, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return view.render('errors/unauthorized')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      throw new Error('Aucun RWA Country ID trouvé pour cet utilisateur.')
    }

    const today = DateTime.now().toISODate()

    // Présences du jour
    const todayPresence = await EmployeeTracking.query()
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .whereRaw('DATE(date_heure) = ?', [today])
      .where('type_evenement', 'Arrivée')
      .orderBy('date_heure', 'desc')

    // Absences du jour
    const todayAbsences = await EmployeeTracking.query()
      .where('rwa_country_id', rwaCountryId)
      .preload('employee')
      .whereRaw('DATE(date_heure) = ?', [today])
      .whereIn('type_evenement', ['Congé', 'Maladie'])

    // Statistiques de la semaine
    const weekStart = DateTime.now().startOf('week').toISODate()
    const weekEnd = DateTime.now().endOf('week').toISODate()

    const weekStats = await EmployeeTracking.query()
      .select('type_evenement')
      .count('* as count')
      .where('rwa_country_id', rwaCountryId)
      .whereBetween('date_heure', [weekStart, weekEnd])
      .groupBy('type_evenement')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('tracking/dashboard', {
      todayPresence,
      todayAbsences,
      weekStats,
      today,
      currentDate,
      instanceCountry
    })
  }
}
