import type { HttpContext } from '@adonisjs/core/http'
import OrganizationalChart from '#models/organizational_chart'
import Employee from '#models/employee'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class OrganizationalChartsController {
  async index({ view, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const page = request.input('page', 1)
    const limit = 10

    const charts = await OrganizationalChart.query()
      .where('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const totalEmployees = await Employee.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('orgcharts/index', {
      nemployee: {
        totalEmployees: totalEmployees[0].$extras.total,
      },
      charts,
      currentDate,
      instanceCountry
    })
  }

  async create({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const employees = await Employee.query()
      .where('actif', true)
      .where('rwa_country_id', rwaCountryId)
      .orderBy('nom')

    const departments = await Database
      .from('employees')
      .select('departement')
      .distinct('departement')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('orgcharts/create', { employees, departments, instanceCountry })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const data = request.only(['nom', 'description', 'structure'])

    if (typeof data.structure === 'string') {
      try {
        data.structure = JSON.parse(data.structure)
      } catch {
        session.flash('error', 'Structure invalide')
        return response.redirect().back()
      }
    }

    await OrganizationalChart.create({
      ...data,
      userId: user.id,
      rwaCountryId,
    })

    session.flash('success', 'Organigramme créé avec succès')
    return response.redirect('/orgcharts')
  }

  async show({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const chart = await OrganizationalChart.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const employees = await Employee.query()
      .where('actif', true)
      .where('rwa_country_id', rwaCountryId)

    const employeesById = employees.reduce((acc, emp) => {
      acc[emp.id] = emp
      return acc
    }, {} as Record<number, Employee>)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('orgcharts/show', { chart, employeesById, instanceCountry })
  }

  async edit({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const chart = await OrganizationalChart.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const employees = await Employee.query()
      .where('actif', true)
      .where('rwa_country_id', rwaCountryId)
      .orderBy('nom')

    const departments = await Database
      .from('employees')
      .select('departement')
      .distinct('departement')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('orgcharts/edit', { chart, employees, departments, instanceCountry })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const chart = await OrganizationalChart.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only(['nom', 'description', 'structure', 'actif'])

    if (typeof data.structure === 'string') {
      try {
        data.structure = JSON.parse(data.structure)
      } catch {
        session.flash('error', 'Structure invalide')
        return response.redirect().back()
      }
    }

    chart.merge({
      ...data,
      userId: user.id,
      rwaCountryId,
    })
    await chart.save()

    session.flash('success', 'Organigramme modifié avec succès')
    return response.redirect('/orgcharts')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const chart = await OrganizationalChart.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await chart.delete()

    session.flash('success', 'Organigramme supprimé avec succès')
    return response.redirect('/orgcharts')
  }

  async generateFromDepartments({ response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    try {
      const departments = await Database
        .from('employees')
        .select('departement')
        .count('* as count')
        .where('actif', true)
        .andWhere('rwa_country_id', rwaCountryId)
        .groupBy('departement')

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
        structure,
        actif: true,
        userId: user.id,
        rwaCountryId,
      })

      session.flash('success', 'Organigramme généré automatiquement avec succès')
      return response.redirect('/orgcharts')
    } catch {
      session.flash('error', 'Erreur lors de la génération de l\'organigramme')
      return response.redirect('/orgcharts')
    }
  }
}
