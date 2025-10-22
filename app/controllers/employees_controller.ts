import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class EmployeesController {
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

    const employees = await Employee.query()
      .where('actif', true)
      .where('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const totalEmployees = await Employee.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('employees/index', {
      nemployee: {
        totalEmployees: totalEmployees[0].$extras.total,
      },
      employees,
      currentDate,
      instanceCountry,
    })
  }

  async create({ response, auth, view }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('employees/create', { currentDate, instanceCountry })
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
      'nom', 'prenom', 'date_naissance', 'contact', 'adresse',
      'poste', 'departement', 'date_prise_fonction', 'salaire',
      'type_contrat', 'duree_contrat', 'date_fin_contrat',
    ])

    // Calculer la date de fin de contrat si nécessaire
    if (data.type_contrat !== 'CDI' && data.duree_contrat > 0) {
      const startDate = DateTime.fromISO(data.date_prise_fonction)
      data.date_fin_contrat = startDate.plus({ months: data.duree_contrat }).toISODate()
    }

    await Employee.create({
      ...data,
      rwaCountryId,
      userId: user.id,
    })

    session.flash('success', 'Employé ajouté avec succès')
    return response.redirect('/employees')
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

    const employee = await Employee.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .preload('promotions')
      .preload('demotions')
      .preload('ratings')
      .preload('paySlips')
      .firstOrFail()

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('employees/show', { employee, instanceCountry, DateTime })
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

    const employee = await Employee.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('employees/edit', { employee, instanceCountry })
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

    const employee = await Employee.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only([
      'nom', 'prenom', 'date_naissance', 'contact', 'adresse',
      'poste', 'departement', 'date_prise_fonction', 'salaire',
      'type_contrat', 'duree_contrat', 'date_fin_contrat',
    ])

    // Calculer la date de fin de contrat si nécessaire
    if (data.type_contrat !== 'CDI' && data.duree_contrat > 0) {
      const startDate = DateTime.fromISO(data.date_prise_fonction)
      data.date_fin_contrat = startDate.plus({ months: data.duree_contrat }).toISODate()
    } else {
      data.date_fin_contrat = null
    }

    employee.merge({
      ...data,
      rwaCountryId,
      userId: user.id,
    })
    await employee.save()

    session.flash('success', 'Employé modifié avec succès')
    return response.redirect('/employees')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const employee = await Employee.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    employee.actif = false
    employee.userId = user.id
    employee.rwaCountryId = rwaCountryId
    await employee.save()

    session.flash('success', 'Employé supprimé avec succès')
    return response.redirect('/employees')
  }
}
