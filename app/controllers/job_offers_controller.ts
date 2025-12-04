import type { HttpContext } from '@adonisjs/core/http'
import JobOffer from '#models/job_offer'
import JobApplication from '#models/job_application'
import { DateTime } from 'luxon'
import Department from '#models/department'
import RwaCountry from '#models/rwa_country'
import UploadService from '../services/upload_service.js'
import { jobApplicationValidator } from '../validators/job_application.js'

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

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('careers/index', { offers, instanceCountry })
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

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('careers/show', { offer, instanceCountry })
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

    const applications = JobApplication.query()
      .where('job_offer_id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .count('* as total')

    await offer.load('applications')
    await offer.updateStatus()

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('careers/edit', { offer, instanceCountry, applications })
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

  // Public landing page for job offers
  async publicIndex({ view, request }: HttpContext) {
    const search = request.input('search', '')
    const departement = request.input('departement', '')

    const query = JobOffer.query()
      .where('statut', 'Publiée')
      .where('date_cloture', '>=', DateTime.now().toISODate())

    if (search) {
      query.where((subQuery) => {
        subQuery
          .where('intitule', 'like', `%${search}%`)
          .orWhere('poste', 'like', `%${search}%`)
          .orWhere('competences_requises', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`)
      })
    }

    if (departement) {
      query.where('departement', departement)
    }

    const offers = await query
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
    // Récupération de l'offre
    const offer = await JobOffer.findOrFail(params.id)
    const offerInstance = offer?.rwaCountryId

    // Récupération des champs classiques
    const data = request.only([
      'nom_complet',
      'email_professionnel',
      'telephone',
      'motivation'
    ])


    // Vérification si l'offre est disponible
    if (offer.statut !== 'Publiée' || offer.isExpired) {
      session.flash('error', "Cette offre n'est plus disponible")
      return response.redirect('/jobs')
    }

    // Vérification de doublon
    const existingQuery = JobApplication.query()
      .where('job_offer_id', offer.id)
      .where('email_professionnel', data.email_professionnel)

    if (offerInstance) {
      existingQuery.where('rwa_country_id', offerInstance)
    }

    const existing = await existingQuery.first()

    if (existing) {
      session.flash('error', 'Vous avez déjà postulé pour cette offre')
      return response.redirect().back()
    }

    // Handle file uploads
    const cvFile = request.file('cv_file', {
      size: '3mb',
      extnames: ['pdf', 'doc', 'docx']
    })

    const lettreMotivationFile = request.file('lettre_motivation_file', {
      size: '3mb',
      extnames: ['pdf', 'doc', 'docx']
    })

    const diplomeFile = request.file('diplome_file', {
      size: '3mb',
      extnames: ['pdf', 'jpg', 'jpeg', 'png']
    })

    console.log(cvFile, lettreMotivationFile, diplomeFile)

    if (!cvFile || !lettreMotivationFile || !diplomeFile) {
      session.flash('error', 'Tous les fichiers sont requis')
      return response.redirect().back()
    }

    // Save files
    const uploader = new UploadService()
    const basePrefix = `applications/${offer.id}`
    //
    const savedCv = await uploader.save(cvFile, basePrefix)
    const savedLettre = await uploader.save(lettreMotivationFile, basePrefix)
    const savedDiplome = await uploader.save(diplomeFile, basePrefix)

    // const uploadsPath = 'uploads/applications'
    // const timestamp = Date.now()

    // await cvFile.move(`public/${uploadsPath}`, {
    //   name: `${timestamp}_cv_${cvFile.clientName}`
    // })
    //
    // await lettreMotivationFile.move(`public/${uploadsPath}`, {
    //   name: `${timestamp}_lettre_${lettreMotivationFile.clientName}`
    // })
    //
    // await diplomeFile.move(`public/${uploadsPath}`, {
    //   name: `${timestamp}_diplome_${diplomeFile.clientName}`
    // })

    // if (cvFile.hasErrors || lettreMotivationFile.hasErrors || diplomeFile.hasErrors) {
    //   session.flash('error', 'Erreur lors du téléchargement des fichiers')
    //   return response.redirect().back()
    // }

    // await JobApplication.create({
    //   jobOfferId: offer.id,
    //   nomComplet: data.nom_complet,
    //   emailProfessionnel: data.email_professionnel,
    //   telephone: data.telephone,
    //   motivation: data.motivation,
    //   cvFilePath: `/${uploadsPath}/${cvFile.fileName}`,
    //   lettreMotivationFilePath: `/${uploadsPath}/${lettreMotivationFile.fileName}`,
    //   diplomeFilePath: `/${uploadsPath}/${diplomeFile.fileName}`,
    //   statut: 'En attente',
    //   rwaCountryId: offerInstance,
    // })

    // console.log(cvFile, lettreFile, diplomeFile)
    // --- UPLOAD ---


    // --- ENREGISTREMENT EN BDD ---
    await JobApplication.create({
      jobOfferId: offer.id,
      nomComplet: data.nom_complet,
      emailProfessionnel: data.email_professionnel,
      telephone: data.telephone,
      motivation: data.motivation,
      cvFilePath: savedCv.key,
      lettreMotivationFilePath: savedLettre.key,
      diplomeFilePath: savedDiplome.key,
      statut: 'En attente',
      rwaCountryId: offerInstance,
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

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('careers/applications', { offer, instanceCountry })
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


  public async downloadCv({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    // on protège par pays si tu utilises rwaCountryId
    const application = await JobApplication.query()
      .where('id', params.id)
      .firstOrFail()

    if (!application.cvFilePath) {
      return response.notFound('CV introuvable pour cette candidature')
    }

    const uploader = new UploadService()
    const url = await uploader.getUrl(application.cvFilePath)

    // Soit tu rediriges vers l'URL,
    return response.redirect(url)

    // soit tu peux stream le fichier directement (optionnel, autre style) :
    // return response.download(url)
  }

  /**
   * Pareil pour la lettre de motivation
   */
  public async downloadLettre({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const application = await JobApplication.query()
      .where('id', params.id)
      .firstOrFail()

    if (!application.lettreMotivationFilePath) {
      return response.notFound('Lettre introuvable pour cette candidature')
    }

    const uploader = new UploadService()
    const url = await uploader.getUrl(application.lettreMotivationFilePath)
    return response.redirect(url)
  }

  /**
   * Pareil pour le diplôme
   */
  
  public async downloadDiplome({ params, response, auth }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Utilisateur non authentifié')

    const application = await JobApplication.query()
      .where('id', params.id)
      .firstOrFail()

    if (!application.diplomeFilePath) {
      return response.notFound('Diplôme introuvable pour cette candidature')
    }

    const uploader = new UploadService()
    const url = await uploader.getUrl(application.diplomeFilePath)
    return response.redirect(url)
  }
}
