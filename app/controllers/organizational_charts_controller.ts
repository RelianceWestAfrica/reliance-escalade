import type { HttpContext } from '@adonisjs/core/http'
import OrganizationalChart from '#models/organizational_chart'
import Employee from '#models/employee'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'


export default class OrganizationalChartsController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10

    const charts = await OrganizationalChart.query()
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const totalEmployees = await Employee.query().count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('orgcharts/index', {
      nemployee: {
        totalEmployees: totalEmployees[0].$extras.total,

      }, charts, currentDate })
  }

  async create({ view }: HttpContext) {
    const employees = await Employee.query().where('actif', true).orderBy('nom')
    const departments = await Database
      .from('employees')
      .select('departement')
      .distinct('departement')
      .where('actif', true)

    return view.render('orgcharts/create', { employees, departments })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['nom', 'description', 'structure'])

    // Parse structure if it's a string
    if (typeof data.structure === 'string') {
      try {
        data.structure = JSON.parse(data.structure)
      } catch (error) {
        session.flash('error', 'Structure invalide')
        return response.redirect().back()
      }
    }

    await OrganizationalChart.create(data)

    session.flash('success', 'Organigramme créé avec succès')
    return response.redirect('/orgcharts')
  }

  async show({ params, view }: HttpContext) {
    const chart = await OrganizationalChart.findOrFail(params.id)

    // Get all employees for the chart
    const employees = await Employee.query().where('actif', true)
    const employeesById = employees.reduce((acc, emp) => {
      acc[emp.id] = emp
      return acc
    }, {})

    return view.render('orgcharts/show', { chart, employeesById })
  }

  async edit({ params, view }: HttpContext) {
    const chart = await OrganizationalChart.findOrFail(params.id)
    const employees = await Employee.query().where('actif', true).orderBy('nom')
    const departments = await Database
      .from('employees')
      .select('departement')
      .distinct('departement')
      .where('actif', true)

    return view.render('orgcharts/edit', { chart, employees, departments })
  }

  async update({ params, request, response, session }: HttpContext) {
    const chart = await OrganizationalChart.findOrFail(params.id)
    const data = request.only(['nom', 'description', 'structure', 'actif'])

    // Parse structure if it's a string
    if (typeof data.structure === 'string') {
      try {
        data.structure = JSON.parse(data.structure)
      } catch (error) {
        session.flash('error', 'Structure invalide')
        return response.redirect().back()
      }
    }

    chart.merge(data)
    await chart.save()

    session.flash('success', 'Organigramme modifié avec succès')
    return response.redirect('/orgcharts')
  }

  async destroy({ params, response, session }: HttpContext) {
    const chart = await OrganizationalChart.findOrFail(params.id)
    await chart.delete()

    session.flash('success', 'Organigramme supprimé avec succès')
    return response.redirect('/orgcharts')
  }

  async generateFromDepartments({ response, session }: HttpContext) {
    try {
      // Get department structure
      const departments = await Database
        .from('employees')
        .select('departement')
        .count('* as count')
        .where('actif', true)
        .groupBy('departement')

      // Create automatic org chart structure
      const structure = {
        name: 'RELIANCE ESCALADE',
        title: 'Direction Générale',
        children: departments.map(dept => ({
          name: dept.departement,
          title: `Département ${dept.departement}`,
          employees: dept.$extras.count,
          children: []
        }))
      }

      await OrganizationalChart.create({
        nom: 'Organigramme Automatique - ' + new Date().toLocaleDateString(),
        description: 'Organigramme généré automatiquement basé sur les départements',
        structure: structure,
        actif: true
      })

      session.flash('success', 'Organigramme généré automatiquement avec succès')
      return response.redirect('/orgcharts')
    } catch (error) {
      session.flash('error', 'Erreur lors de la génération de l\'organigramme')
      return response.redirect('/orgcharts')
    }
  }
}
