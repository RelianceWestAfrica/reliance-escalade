import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import Post from '#models/post'
import Promotion from '#models/promotion'
import Demotion from '#models/demotion'
import PaySlip from '#models/pay_slip'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import User from '#models/user'


export default class DashboardController {
  async index({ view }: HttpContext) {
    // Statistiques pour le dashboard
    const totalEmployees = await Employee.query().where('actif', true).count('* as total')
    const totalUsers = await User.query().where('actif', true).count('* as total')
    const totalPosts = await Post.query().count('* as total')
    const promotionsScheduled = await Promotion.query().where('statut', 'En attente').count('* as total')
    const demotionsScheduled = await Demotion.query().where('statut', 'En attente').count('* as total')
    const paySlipsGenerated = await PaySlip.query().where('statut', 'Générée').count('* as total')

    // Employés par département
    const employeesByDepartment = await Database
      .from('employees')
      .select('departement')
      .count('* as count')
      .where('actif', true)
      .groupBy('departement')

    // Activités récentes (derniers employés ajoutés, promotions, etc.)
    const recentEmployees = await Employee.query()
      .where('actif', true)
      .orderBy('created_at', 'desc')
      .limit(3)

    const recentPromotions = await Promotion.query()
      .preload('employee')
      .orderBy('created_at', 'desc')
      .limit(3)

  const currentDate = DateTime.local().setLocale('fr').toFormat("dd LLLL yyyy")

  // Date actuelle
  const now = DateTime.local()

  // ➤ 1. Total des employés ajoutés ce mois-ci
  const employeesAddedThisMonth = await Employee.query()
    .whereRaw('EXTRACT(MONTH FROM created_at) = ?', [now.month])
    .andWhereRaw('EXTRACT(YEAR FROM created_at) = ?', [now.year])
    .count('* as total')

  // ➤ 2. Total des promotions à venir (date_vigueur > aujourd’hui)
  const upcomingPromotions = await Promotion.query()
    .where('date_vigueur', '>', now.toISODate())
    .count('* as total')

  // ➤ 3. Total des fiches de paie générées le mois précédent
  const previousMonth = now.minus({ months: 1 })
  const previousMonthName = previousMonth.setLocale('fr').toFormat('LLLL') // Ex: "juin"
  const previousYear = previousMonth.year

  const paySlipsLastMonth = await PaySlip.query()
    .where('statut', 'Générée')
    .where('mois', previousMonthName)
    .where('annee', previousYear)
    .count('* as total')

    return view.render('dashboard/index', {
      stats: {
        totalEmployees: totalEmployees[0].$extras.total,
        totalPosts: totalPosts[0].$extras.total,
        promotionsScheduled: promotionsScheduled[0].$extras.total,
        demotionsScheduled: demotionsScheduled[0].$extras.total,
        paySlipsGenerated: paySlipsGenerated[0].$extras.total,
        totalUsers: totalUsers[0].$extras.total,
        employeesAddedThisMonth: employeesAddedThisMonth[0].$extras.total,
        upcomingPromotions: upcomingPromotions[0].$extras.total,
        paySlipsLastMonth: paySlipsLastMonth[0].$extras.total,

      },
      employeesByDepartment,
      recentEmployees,
      recentPromotions,
      currentDate,
    })
  }
}
