import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

export default class EmployeesController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10

    const employees = await Employee.query()
      .where('actif', true)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const totalEmployees = await Employee.query().count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('employees/index', {
      nemployee: {
        totalEmployees: totalEmployees[0].$extras.total,

      }, employees, currentDate})
  }

  async create({ view }: HttpContext) {

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('employees/create', { currentDate})
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'nom', 'prenom', 'date_naissance', 'contact', 'adresse',
      'poste', 'departement', 'date_prise_fonction', 'salaire',
      'type_contrat', 'duree_contrat', 'date_fin_contrat'
    ])

    // Calculer la date de fin de contrat si nécessaire
    if (data.type_contrat !== 'CDI' && data.duree_contrat > 0) {
      const startDate = DateTime.fromISO(data.date_prise_fonction)
      data.date_fin_contrat = startDate.plus({ months: data.duree_contrat }).toISODate()
    }

    await Employee.create(data)

    session.flash('success', 'Employé ajouté avec succès')
    return response.redirect('/employees')
  }

  async show({ params, view }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)
    await employee.load('promotions')
    await employee.load('demotions')
    await employee.load('ratings')
    await employee.load('paySlips')

    return view.render('employees/show', { employee, DateTime })
  }

  async edit({ params, view }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)
    return view.render('employees/edit', { employee })
  }

  async update({ params, request, response, session }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)
    const data = request.only([
      'nom', 'prenom', 'date_naissance', 'contact', 'adresse',
      'poste', 'departement', 'date_prise_fonction', 'salaire',
      'type_contrat', 'duree_contrat', 'date_fin_contrat'
    ])

    // Calculer la date de fin de contrat si nécessaire
    if (data.type_contrat !== 'CDI' && data.duree_contrat > 0) {
      const startDate = DateTime.fromISO(data.date_prise_fonction)
      data.date_fin_contrat = startDate.plus({ months: data.duree_contrat }).toISODate()
    } else {
      data.date_fin_contrat = null
    }

    employee.merge(data)
    await employee.save()

    session.flash('success', 'Employé modifié avec succès')
    return response.redirect('/employees')
  }

  async destroy({ params, response, session }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)
    employee.actif = false
    await employee.save()

    session.flash('success', 'Employé supprimé avec succès')
    return response.redirect('/employees')
  }
}
