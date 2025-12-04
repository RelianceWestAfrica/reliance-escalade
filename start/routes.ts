/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

// import router from '@adonisjs/core/services/router'
// router.on('/').render('pages/home')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import JobOffersController from '#controllers/job_offers_controller'

// Route d'accès (page d'accueil)
router.get('/', '#controllers/auth_controller.showAccessCode').as('auth.access_code')
router.post('/verify-access', '#controllers/auth_controller.verifyAccess').as('auth.verify_access')

// Routes d'authentification
router.get('/login', '#controllers/auth_controller.showLogin').as('auth.login')
router.post('/login', '#controllers/auth_controller.login')
router.post('/logout', '#controllers/auth_controller.logout').as('auth.logout')

// Redirection de la racine vers le dashboard
// router.get('/', ({ response }) => response.redirect('/dashboard'))

// Routes protégées
router.group(() => {
  // Dashboard
  router.get('/dashboard', '#controllers/dashboard_controller.index').as('dashboard')

  // Employés
  router.resource('employees', '#controllers/employees_controller')
  router.post('/employees/:id/update', '#controllers/employees_controller.update').as('employees.update_employee')
  router.post('/employees/:id/delete', '#controllers/employees_controller.destroy').as('employees.destroy_employee')

  // Postes
  router.resource('posts', '#controllers/posts_controller')
  router.post('/posts/:id/update', '#controllers/posts_controller.update').as('posts.update_post')
  router.post('/posts/:id/delete', '#controllers/posts_controller.destroy').as('posts.destroy_post')

  // Promotions
  router.resource('promotions', '#controllers/promotions_controller')
  router.post('/promotions/:id/apply', '#controllers/promotions_controller.apply').as('promotions.apply')
  router.post('/promotions/:id/update', '#controllers/promotions_controller.update').as('promotions.update_promotion')
  router.post('/promotions/:id/delete', '#controllers/promotions_controller.destroy').as('promotions.destroy_promotion')

  // Démotions
  router.resource('demotions', '#controllers/demotions_controller')
  router.post('/demotions/:id/apply', '#controllers/demotions_controller.apply').as('demotions.apply')
  router.post('/demotions/:id/update', '#controllers/demotions_controller.update').as('demotions.update_demotion')
  router.post('/demotions/:id/delete', '#controllers/demotions_controller.destroy').as('demotions.destroy_demotion')


  // Fiches de paie
  router.resource('pay-slips', '#controllers/pay_slips_controller')
  router.post('/pay-slips/generate-all', '#controllers/pay_slips_controller.generateAll').as('pay_slips.generate_all')
  router.post('/pay-slips/:id/cancel', '#controllers/pay_slips_controller.cancel').as('pay_slips.cancel')
  router.post('/pay-slips/:id/update', '#controllers/pay-slips_controller.update').as('pay-slips.update_payslip')
  router.post('/pay-slips/:id/delete', '#controllers/pay-slips_controller.destroy').as('pay-slips.destroy_payslip')


  // Suivi des employés (Employee Tracking)
  router.resource('tracking', '#controllers/employee_tracking_controller')
  // Route personnalisée pour le dashboard de suivi
  router.get('/tracking-dashboard', '#controllers/employee_tracking_controller.dashboard').as('tracking.dashboard')
  router.post('/tracking/:id/update', '#controllers/employee_tracking_controller.update').as('tracking.update_tracking')
  router.post('/tracking/:id/delete', '#controllers/employee_tracking_controller.destroy').as('tracking.destroy_tracking')


  // Statistiques
  router.group(() => {
    router.get('/', '#controllers/statistics_controller.index').as('statistics.index')
    router.get('/departments', '#controllers/statistics_controller.departmentStats').as('statistics.departments')
    router.get('/salaries', '#controllers/statistics_controller.salaryStats').as('statistics.salaries')
  }).prefix('/statistics')


  // Organigrammes
  router.resource('orgcharts', '#controllers/organizational_charts_controller')
  // Route spéciale pour générer automatiquement un organigramme
  router.post('/orgcharts/generate-from-departments', '#controllers/organizational_charts_controller.generateFromDepartments').as('orgcharts.generate_auto')


  // Careers routes (protected)
  router.resource('careers', '#controllers/job_offers_controller')
  router.get('/careers/:id/applications', '#controllers/job_offers_controller.applications').as('careers.applications')
  router.post('/careers/:id/update', '#controllers/job_offers_controller.updateApplicationStatus').as('careers.applications.update')
  router.post('/applications/:id/status', '#controllers/job_offers_controller.updateApplicationStatus').as('applications.update_status')
  router.post('/offers/:id/update', '#controllers/job_offers_controller.update').as('offers.update_offer')
  router.post('/offers/:id/delete', '#controllers/job_offers_controller.destroy').as('offers.destroy_offer')



  // rwa-countries
  router.get('/rwa-countries', '#controllers/rwa_countries_controller.index').as('rwa_countries.index')
  router.get('/rwa-countries/create', '#controllers/rwa_countries_controller.create').as('rwa_countries.create')
  router.get('/rwa-countries/:id', '#controllers/rwa_countries_controller.show').as('rwa_countries.show')
  router.get('/rwa-countries/:id/edit', '#controllers/rwa_countries_controller.edit').as('rwa_countries.edit')
  router.put('/rwa-countries/:id', '#controllers/rwa_countries_controller.update').as('rwa_countries.update')
  router.delete('/rwa-countries/:id', '#controllers/rwa_countries_controller.destroy').as('rwa_countries.destroy')
  router.post('/rwa-countries', '#controllers/rwa_countries_controller.store').as('rwa_countries.store')
  router.post('/rwa-countries/:id/toggle-status', '#controllers/rwa_countries_controller.toggleStatus').as('rwa_countries.toggle_status')


  // Utilisateurs (Admin seulement)
  router.group(() => {
    router.resource('users', '#controllers/users_controller')
    router.post('/users/:id/toggle-status', '#controllers/users_controller.toggleStatus').as('users.toggle_status')
    router.post('/users/:id/update', '#controllers/users_controller.update').as('users.update_user')
  router.post('/users/:id/delete', '#controllers/users_controller.destroy').as('users.destroy_user')
  }).middleware(middleware.adminOnly())

}).middleware(middleware.auth())

// Liste des offres publiques
router.get('/jobs', '#controllers/job_offers_controller.publicIndex').as('jobs.index')
// Détail d’une offre publique
router.get('/jobs/:id', '#controllers/job_offers_controller.publicShow').as('jobs.show')
// Formulaire de candidature (soumission)
router.post('/jobs/:id/apply', '#controllers/job_offers_controller.apply').as('jobs.apply')

router
  .group(() => {
    router.get('/applications/:id/cv', [JobOffersController, 'downloadCv'])
    router.get('/applications/:id/lettre', [JobOffersController, 'downloadLettre'])
    router.get('/applications/:id/diplome', [JobOffersController, 'downloadDiplome'])
  })
  .middleware(middleware.auth())
