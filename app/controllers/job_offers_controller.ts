import type { HttpContext } from '@adonisjs/core/http'
import JobOffer from '#models/job_offer'
import JobApplication from '#models/job_application'
import { DateTime } from 'luxon'
import Department from '#models/department'

export default class JobOffersController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10

    const offers = await JobOffer.query()
      .withCount('applications')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Update expired offers
    for (const offer of offers) {
      await offer.updateStatus()
    }

    return view.render('careers/index', { offers })
  }

  async create({ view }: HttpContext) {
    return view.render('careers/create')
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'intitule', 'poste', 'departement', 'type_contrat',
      'competences_requises', 'date_cloture', 'description',
      'salaire', 'experience'
    ])

    await JobOffer.create(data)

    session.flash('success', 'Offre d\'emploi créée avec succès')
    return response.redirect('/careers')
  }

  async show({ params, view }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    await offer.load('applications')
    await offer.updateStatus()

    return view.render('careers/show', { offer })
  }

  async edit({ params, view }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    return view.render('careers/edit', { offer })
  }

  async update({ params, request, response, session }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    const data = request.only([
      'intitule', 'poste', 'departement', 'type_contrat',
      'competences_requises', 'date_cloture', 'description',
      'salaire', 'experience', 'statut'
    ])

    offer.merge(data)
    await offer.save()

    session.flash('success', 'Offre d\'emploi modifiée avec succès')
    return response.redirect('/careers')
  }

  async destroy({ params, response, session }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    await offer.delete()

    session.flash('success', 'Offre d\'emploi supprimée avec succès')
    return response.redirect('/careers')
  }

  // Public landing page for job offers
  async publicIndex({ view }: HttpContext) {
    const offers = await JobOffer.query()
      .where('statut', 'Publiée')
      .where('date_cloture', '>=', DateTime.now().toISODate())
      .withCount('applications')
      .orderBy('created_at', 'desc')

    const departments = await Department.query()
      .orderBy('nom', 'asc')

    return view.render('public/careers', { offers, departments })
  }

  async publicShow({ params, view }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)

    // Check if offer is still available
    if (offer.statut !== 'Publiée' || offer.isExpired) {
      return view.render('public/offer_unavailable', { offer })
    }

    return view.render('public/apply', { offer })
  }

  async apply({ params, request, response, session }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    const data = request.only(['nom_complet', 'email_professionnel', 'telephone', 'motivation'])

    // Check if offer is still available
    if (offer.statut !== 'Publiée' || offer.isExpired) {
      session.flash('error', 'Cette offre n\'est plus disponible')
      return response.redirect('/jobs')
    }

    // Check if user already applied
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

  async applications({ params, view }: HttpContext) {
    const offer = await JobOffer.findOrFail(params.id)
    await offer.load('applications')

    return view.render('careers/applications', { offer })
  }

  async updateApplicationStatus({ params, request, response, session }: HttpContext) {
    const application = await JobApplication.findOrFail(params.id)
    const { statut } = request.only(['statut'])

    application.statut = statut
    await application.save()

    session.flash('success', 'Statut de candidature mis à jour')
    return response.redirect().back()
  }
}
