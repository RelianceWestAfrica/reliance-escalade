import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import Post from '#models/post'
import Promotion from '#models/promotion'
import Demotion from '#models/demotion'
import PaySlip from '#models/pay_slip'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import User from '#models/user'
import RwaCountry from '#models/rwa_country'

export default class DashboardController {
  async index({ auth, view }: HttpContext) {
    // On récupère l’utilisateur connecté
    const user = auth.user!
    const rwaCountryId = user.rwaCountryId

    if (!rwaCountryId) {
      throw new Error('Aucun pays d\'instance RWA n\'a été trouvéé rattachée à cet utilisateur.')
    }
    const userId = user.id

    // Statistiques pour le dashboard (scopées par rwa_country_id)
    const totalEmployees = await Employee.query()
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    const totalUsers = await User.query()
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    const totalPosts = await Post.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry



    const promotionsScheduled = await Promotion.query()
      .where('statut', 'En attente')
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    const demotionsScheduled = await Demotion.query()
      .where('statut', 'En attente')
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    const paySlipsGenerated = await PaySlip.query()
      .where('statut', 'Générée')
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    // Employés par département
    const employeesByDepartment = await Database
      .from('employees')
      .select('departement')
      .count('* as count')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .groupBy('departement')

    // Activités récentes (derniers employés ajoutés, promotions, etc.)
    const recentEmployees = await Employee.query()
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .limit(3)

    const recentPromotions = await Promotion.query()
      .preload('employee')
      .where('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .limit(3)

    const currentDate = DateTime.local().setLocale('fr').toFormat("dd LLLL yyyy")
    const currentYear = DateTime.local().setLocale('fr').toFormat("yyyy")


    // Date actuelle
    const now = DateTime.local()

    // ➤ 1. Total des employés ajoutés ce mois-ci
    const employeesAddedThisMonth = await Employee.query()
      .whereRaw('EXTRACT(MONTH FROM created_at) = ?', [now.month])
      .andWhereRaw('EXTRACT(YEAR FROM created_at) = ?', [now.year])
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    // ➤ 2. Total des promotions à venir (date_vigueur > aujourd’hui)
    const upcomingPromotions = await Promotion.query()
      .where('date_vigueur', '>', now.toISODate())
      .andWhere('rwa_country_id', rwaCountryId)
      .count('* as total')

    // ➤ 3. Total des fiches de paie générées le mois précédent
    const previousMonth = now.minus({ months: 1 })
    const previousMonthName = previousMonth.setLocale('fr').toFormat('LLLL') // Ex: "juin"
    const previousYear = previousMonth.year

    const paySlipsLastMonth = await PaySlip.query()
      .where('statut', 'Générée')
      .andWhere('mois', previousMonthName)
      .andWhere('annee', previousYear)
      .andWhere('rwa_country_id', rwaCountryId)
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
      currentYear,
      userId, // utile si tu veux l'afficher dans le dashboard
      rwaCountryId,
      instanceCountry
    })
  }
}
