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

  // Postes
  router.resource('posts', '#controllers/posts_controller')
  router.post('/posts/:id/update', '#controllers/posts_controller.update').as('posts.update_post')
  router.post('/posts/:id/delete', '#controllers/posts_controller.destroy').as('posts.destroy_post')

  // Promotions
  router.resource('promotions', '#controllers/promotions_controller')
  router.post('/promotions/:id/apply', '#controllers/promotions_controller.apply').as('promotions.apply')

  // Démotions
  router.resource('demotions', '#controllers/demotions_controller')
  router.post('/demotions/:id/apply', '#controllers/demotions_controller.apply').as('demotions.apply')

  // Fiches de paie
  router.resource('pay-slips', '#controllers/pay_slips_controller')
  router.post('/pay-slips/generate-all', '#controllers/pay_slips_controller.generateAll').as('pay_slips.generate_all')
  router.post('/pay-slips/:id/cancel', '#controllers/pay_slips_controller.cancel').as('pay_slips.cancel')


  // Suivi des employés (Employee Tracking)
  router.resource('tracking', '#controllers/employee_tracking_controller')
  // Route personnalisée pour le dashboard de suivi
  router.get('/tracking-dashboard', '#controllers/employee_tracking_controller.dashboard').as('tracking.dashboard')


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
  // Liste des candidatures pour une offre
  router.get('/careers/:id/applications', '#controllers/job_offers_controller.applications').as('careers.applications')
  // Mise à jour du statut d’une candidature
  router.post('/applications/:id/status', '#controllers/job_offers_controller.updateApplicationStatus').as('applications.update_status')



  // Utilisateurs (Admin seulement)
  router.group(() => {
    router.resource('users', '#controllers/users_controller')
    router.post('/users/:id/toggle-status', '#controllers/users_controller.toggleStatus').as('users.toggle_status')
  }).middleware(middleware.adminOnly())

}).middleware(middleware.auth())

// Liste des offres publiques
router.get('/jobs', '#controllers/job_offers_controller.publicIndex').as('jobs.index')
// Détail d’une offre publique
router.get('/jobs/:id', '#controllers/job_offers_controller.publicShow').as('jobs.show')
// Formulaire de candidature (soumission)
router.post('/jobs/:id/apply', '#controllers/job_offers_controller.apply').as('jobs.apply')
