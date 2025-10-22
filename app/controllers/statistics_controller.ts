import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import Promotion from '#models/promotion'
import Demotion from '#models/demotion'
import PaySlip from '#models/pay_slip'
import EmployeeTracking from '#models/employee_tracking'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class StatisticsController {
  async index({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    // Statistiques générales
    const totalEmployees = await Employee.query()
      .where('actif', true)
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const totalPromotions = await Promotion.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const totalDemotions = await Demotion.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const totalPaySlips = await PaySlip.query()
      .where('statut', 'Générée')
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    // Répartition par département
    const employeesByDepartment = await Database
      .from('employees')
      .select('departement')
      .count('* as count')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .groupBy('departement')

    // Répartition par type de contrat
    const employeesByContract = await Database
      .from('employees')
      .select('type_contrat')
      .count('* as count')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .groupBy('type_contrat')

    // Évolution des salaires par mois
    const salaryEvolution = await Database
      .from('promotions')
      .select(Database.raw('DATE_FORMAT(date_vigueur, "%Y-%m") as mois'))
      .sum('montant_augmentation as total_augmentation')
      .where('statut', 'Appliquée')
      .andWhere('rwa_country_id', rwaCountryId)
      .groupByRaw('DATE_FORMAT(date_vigueur, "%Y-%m")')
      .orderBy('mois', 'desc')
      .limit(12)

    // Top 5 des départements par nombre d'employés
    const topDepartments = await Database
      .from('employees')
      .select('departement')
      .count('* as count')
      .avg('salaire as salaire_moyen')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .groupBy('departement')
      .orderBy('count', 'desc')
      .limit(5)

    // Statistiques de présence (derniers 30 jours)
    const attendanceStats = await Database
      .from('employee_trackings')
      .select('type_evenement')
      .count('* as count')
      .where('date_heure', '>=', DateTime.now().minus({ days: 30 }).toSQL())
      .andWhere('rwa_country_id', rwaCountryId)
      .groupBy('type_evenement')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('statistics/index', {
      stats: {
        totalEmployees: totalEmployees[0].$extras.total,
        totalPromotions: totalPromotions[0].$extras.total,
        totalDemotions: totalDemotions[0].$extras.total,
        totalPaySlips: totalPaySlips[0].$extras.total,
      },
      employeesByDepartment,
      employeesByContract,
      salaryEvolution,
      topDepartments,
      attendanceStats,
      currentDate,
      instanceCountry,
    })
  }

  async departmentStats({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const departmentStats = await Database
      .from('employees')
      .select('departement')
      .count('* as total_employes')
      .avg('salaire as salaire_moyen')
      .sum('salaire as masse_salariale')
      .where('actif', true)
      .andWhere('rwa_country_id', rwaCountryId)
      .groupBy('departement')

    return view.render('statistics/departments', { departmentStats })
  }

  async salaryStats({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const salaryRanges = await Database.raw(`
      SELECT
        CASE
          WHEN salaire < 500000 THEN 'Moins de 500K'
          WHEN salaire BETWEEN 500000 AND 1000000 THEN '500K - 1M'
          WHEN salaire BETWEEN 1000000 AND 1500000 THEN '1M - 1.5M'
          WHEN salaire BETWEEN 1500000 AND 2000000 THEN '1.5M - 2M'
          ELSE 'Plus de 2M'
        END as tranche_salaire,
        COUNT(*) as nombre_employes,
        AVG(salaire) as salaire_moyen
      FROM employees
      WHERE actif = 1
      AND rwa_country_id = ?
      GROUP BY tranche_salaire
      ORDER BY salaire_moyen ASC
    `, [rwaCountryId])

    return view.render('statistics/salaries', { salaryRanges: salaryRanges[0] })
  }
}






// import type { HttpContext } from '@adonisjs/core/http'
// import Employee from '#models/employee'
// import Promotion from '#models/promotion'
// import Demotion from '#models/demotion'
// import PaySlip from '#models/pay_slip'
// import EmployeeTracking from '#models/employee_tracking'
// import Database from '@adonisjs/lucid/services/db'
// import { DateTime } from 'luxon'

// export default class StatisticsController {
//   async index({ view }: HttpContext) {
//     // Statistiques générales
//     const totalEmployees = await Employee.query().where('actif', true).count('* as total')
//     const totalPromotions = await Promotion.query().count('* as total')
//     const totalDemotions = await Demotion.query().count('* as total')
//     const totalPaySlips = await PaySlip.query().where('statut', 'Générée').count('* as total')

//     // Répartition par département
//     const employeesByDepartment = await Database
//       .from('employees')
//       .select('departement')
//       .count('* as count')
//       .where('actif', true)
//       .groupBy('departement')

//     // Répartition par type de contrat
//     const employeesByContract = await Database
//       .from('employees')
//       .select('type_contrat')
//       .count('* as count')
//       .where('actif', true)
//       .groupBy('type_contrat')

//     // Évolution des salaires par mois
//     const salaryEvolution = await Database
//       .from('promotions')
//       .select(Database.raw('DATE_FORMAT(date_vigueur, "%Y-%m") as mois'))
//       .sum('montant_augmentation as total_augmentation')
//       .where('statut', 'Appliquée')
//       .groupByRaw('DATE_FORMAT(date_vigueur, "%Y-%m")')
//       .orderBy('mois', 'desc')
//       .limit(12)

//     // Top 5 des départements par nombre d'employés
//     const topDepartments = await Database
//       .from('employees')
//       .select('departement')
//       .count('* as count')
//       .avg('salaire as salaire_moyen')
//       .where('actif', true)
//       .groupBy('departement')
//       .orderBy('count', 'desc')
//       .limit(5)

//     // Statistiques de présence (derniers 30 jours)
//     const attendanceStats = await Database
//       .from('employee_trackings')
//       .select('type_evenement')
//       .count('* as count')
//       .where('date_heure', '>=', DateTime.now().minus({ days: 30 }).toSQL())
//       .groupBy('type_evenement')

//     const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")


//     return view.render('statistics/index', {
//       stats: {
//         totalEmployees: totalEmployees[0].$extras.total,
//         totalPromotions: totalPromotions[0].$extras.total,
//         totalDemotions: totalDemotions[0].$extras.total,
//         totalPaySlips: totalPaySlips[0].$extras.total,
//       },
//       employeesByDepartment,
//       employeesByContract,
//       salaryEvolution,
//       topDepartments,
//       attendanceStats,
//       currentDate
//     })
//   }

//   async departmentStats({ view }: HttpContext) {
//     const departmentStats = await Database
//       .from('employees')
//       .select('departement')
//       .count('* as total_employes')
//       .avg('salaire as salaire_moyen')
//       .sum('salaire as masse_salariale')
//       .where('actif', true)
//       .groupBy('departement')

//     return view.render('statistics/departments', { departmentStats })
//   }

//   async salaryStats({ view }: HttpContext) {
//     const salaryRanges = await Database.raw(`
//       SELECT
//         CASE
//           WHEN salaire < 500000 THEN 'Moins de 500K'
//           WHEN salaire BETWEEN 500000 AND 1000000 THEN '500K - 1M'
//           WHEN salaire BETWEEN 1000000 AND 1500000 THEN '1M - 1.5M'
//           WHEN salaire BETWEEN 1500000 AND 2000000 THEN '1.5M - 2M'
//           ELSE 'Plus de 2M'
//         END as tranche_salaire,
//         COUNT(*) as nombre_employes,
//         AVG(salaire) as salaire_moyen
//       FROM employees
//       WHERE actif = 1
//       GROUP BY tranche_salaire
//       ORDER BY salaire_moyen ASC
//     `)

//     return view.render('statistics/salaries', { salaryRanges: salaryRanges[0] })
//   }
// }
