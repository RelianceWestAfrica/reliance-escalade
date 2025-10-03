import type { HttpContext } from '@adonisjs/core/http'
import JobOffer from '#models/job_offer'
import JobApplication from '#models/job_application'
import { DateTime } from 'luxon'
import Department from '#models/department'

export default class JobOffersController {
  async index({ view, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const page = request.input('page', 1)
    const limit = 10

    const offers = await JobOffer.query()
      .where('rwa_country_id', rwaCountryId)
      .withCount('applications')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Mise à jour des offres expirées
    for (const offer of offers) {
      await offer.updateStatus()
    }

    return view.render('careers/index', { offers })
  }

  async create({ view }: HttpContext) {
    return view.render('careers/create')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const data = request.only([
      'intitule', 'poste', 'departement', 'type_contrat',
      'competences_requises', 'date_cloture', 'description',
      'salaire', 'experience',
    ])

    await JobOffer.create({
      ...data,
      rwaCountryId,
      userId: user.id,
    })

    session.flash('success', "Offre d'emploi créée avec succès")
    return response.redirect('/careers')
  }

  async show({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const offer = await JobOffer.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await offer.load('applications')
    await offer.updateStatus()

    return view.render('careers/show', { offer })
  }

  async edit({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const offer = await JobOffer.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    return view.render('careers/edit', { offer })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const offer = await JobOffer.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only([
      'intitule', 'poste', 'departement', 'type_contrat',
      'competences_requises', 'date_cloture', 'description',
      'salaire', 'experience', 'statut', 
    ])

    offer.merge({
      ...data,
      rwaCountryId,
      userId: user.id,
    })
    await offer.save()

    session.flash('success', "Offre d'emploi modifiée avec succès")
    return response.redirect('/careers')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const offer = await JobOffer.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await offer.delete()

    session.flash('success', "Offre d'emploi supprimée avec succès")
    return response.redirect('/careers')
  }

  // 🔓 Partie publique (inchangée)
  async publicIndex({ view }: HttpContext) {
    const offers = await JobOffer.query()
      .where('statut', 'Publiée')
      .where('date_cloture', '>=', DateTime.now().toISODate())
      .withCount('applications')
      .orderBy('created_at', 'desc')

    const departments = await Department.query().orderBy('nom', 'asc')

    return view.render('public/careers', { offers, departments })
  }

  async publicShow({ params, view }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)

    if (offer.statut !== 'Publiée' || offer.isExpired) {
      return view.render('public/offer_unavailable', { offer })
    }

    return view.render('public/apply', { offer })
  }

  async apply({ params, request, response, session }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    const data = request.only(['nom_complet', 'email_professionnel', 'telephone', 'motivation'])

    if (offer.statut !== 'Publiée' || offer.isExpired) {
      session.flash('error', "Cette offre n'est plus disponible")
      return response.redirect('/jobs')
    }

    const existingApplication = await JobApplication.query()
      .where('job_offer_id', offer.id)
      .where('email_professionnel', data.email_professionnel)
      .first()

    if (existingApplication) {
      session.flash('error', 'Vous avez déjà postulé pour cette offre')
      return response.redirect().back()
    }

    await JobApplication.create({
      jobOfferId: offer.id,
      nomComplet: data.nom_complet,
      emailProfessionnel: data.email_professionnel,
      telephone: data.telephone,
      motivation: data.motivation,
      statut: 'En attente'
    })

    session.flash('success', 'Votre candidature a été soumise avec succès')
    return response.redirect('/jobs')
  }

  async applications({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const offer = await JobOffer.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .preload('applications')
      .firstOrFail()

    return view.render('careers/applications', { offer })
  }

  async updateApplicationStatus({ params, request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const application = await JobApplication.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const { statut } = request.only(['statut'])

    application.statut = statut
    application.userId = user.id
    application.rwaCountryId = rwaCountryId
    await application.save()

    session.flash('success', 'Statut de candidature mis à jour')
    return response.redirect().back()
  }
}
