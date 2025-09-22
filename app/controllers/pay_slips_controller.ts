import type { HttpContext } from '@adonisjs/core/http'
import PaySlip from '#models/pay_slip'
import Employee from '#models/employee'

export default class PaySlipsController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10

    const employees = await Employee.query().where('actif', true)

    const paySlips = await PaySlip.query()
      .preload('employee')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return view.render('pay_slips/index', { paySlips, employees })
  }

  async create({ view }: HttpContext) {
    const employees = await Employee.query().where('actif', true)
    return view.render('pay_slips/create', { employees })
  }

  async store({ request, response, session }: HttpContext) {
    const { employee_id, mois, annee } = request.only(['employee_id', 'mois', 'annee'])

    const employee = await Employee.findOrFail(employee_id)

    // Vérifier si une fiche existe déjà
    const existing = await PaySlip.query()
      .where('employee_id', employee_id)
      .where('mois', mois)
      .where('annee', annee)
      .first()

    if (existing) {
      session.flash('error', 'Une fiche de paie existe déjà pour cette période')
      return response.redirect().back()
    }

    // Calculer les cotisations (15%)
    const cotisations = Math.round(employee.salaire * 0.315)
    const salaireNet = employee.salaire - cotisations

    await PaySlip.create({
      employeeId: employee.id,
      mois,
      annee,
      salaireBrut: employee.salaire,
      cotisations,
      salaireNet,
      statut: 'Générée'
    })

    session.flash('success', 'Fiche de paie générée avec succès')
    return response.redirect('/pay-slips')
  }

  async generateAll({ request, response, session }: HttpContext) {
    const { mois, annee } = request.only(['mois', 'annee'])

    const employees = await Employee.query().where('actif', true)
    let generated = 0

    for (const employee of employees) {
      // Vérifier si une fiche existe déjà
      const existing = await PaySlip.query()
        .where('employee_id', employee.id)
        .where('mois', mois)
        .where('annee', annee)
        .first()

      if (!existing) {
        const cotisations = Math.round(employee.salaire * 0.315)
        const salaireNet = employee.salaire - cotisations

        await PaySlip.create({
          employeeId: employee.id,
          mois,
          annee,
          salaireBrut: employee.salaire,
          cotisations,
          salaireNet,
          statut: 'Générée'
        })
        generated++
      }
    }

    session.flash('success', `${generated} fiches de paie générées avec succès`)
    return response.redirect('/pay-slips')
  }

  async cancel({ params, response, session }: HttpContext) {
    const paySlip = await PaySlip.findOrFail(params.id)
    paySlip.statut = 'Annulée'
    await paySlip.save()

    session.flash('success', 'Fiche de paie annulée avec succès')
    return response.redirect('/pay-slips')
  }

  async destroy({ params, response, session }: HttpContext) {
    const paySlip = await PaySlip.findOrFail(params.id)
    await paySlip.delete()

    session.flash('success', 'Fiche de paie supprimée avec succès')
    return response.redirect('/pay-slips')
  }
}
