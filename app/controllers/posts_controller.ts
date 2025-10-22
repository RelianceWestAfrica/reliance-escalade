import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { DateTime } from 'luxon'
import RwaCountry from '#models/rwa_country'

export default class PostsController {
  /**
   * Liste paginée des postes
   */
  async index({ view, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const page = request.input('page', 1)
    const limit = 20

    const posts = await Post.query()
      .where('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const totalPosts = await Post.query()
      .where('rwa_country_id', rwaCountryId)
      .count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('posts/index', {
      nposts: {
        totalPosts: totalPosts[0].$extras.total,
      },
      posts,
      currentDate,
      instanceCountry,
    })
  }

  /**
   * Affiche la page de création
   */
  async create({ view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('posts/create', { currentDate, instanceCountry })
  }

  /**
   * Crée un nouveau poste
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const data = request.only(['intitule', 'departement', 'description', 'montant_augmentation', ])

    await Post.create({
      ...data,
      rwaCountryId,
      userId: user.id,
    })

    session.flash('success', 'Poste créé avec succès')
    return response.redirect('/posts')
  }

  /**
   * Affiche la page d’édition
   */
  async edit({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const post = await Post.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('posts/edit', { post, instanceCountry })
  }

  /**
   * Met à jour un poste
   */
  async update({ params, request, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const post = await Post.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only(['intitule', 'departement', 'description', 'montant_augmentation', ])

    post.merge({
      ...data,
      rwaCountryId,
      userId: user.id,
    })

    await post.save()

    session.flash('success', 'Poste modifié avec succès')
    return response.redirect('/posts')
  }

  /**
   * Affiche un poste
   */
  async show({ params, view, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const post = await Post.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const rwaCountry = await RwaCountry.findBy('id', rwaCountryId)
    const instanceCountry = rwaCountry?.instanceCountry

    return view.render('posts/show', { post, instanceCountry })
  }

  /**
   * Supprime un poste
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Utilisateur non authentifié')
    }

    const rwaCountryId = user.rwaCountryId
    if (!rwaCountryId) {
      return response.badRequest('Code pays non défini pour cet utilisateur')
    }

    const post = await Post.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await post.delete()

    session.flash('success', 'Poste supprimé avec succès')
    return response.redirect('/posts')
  }
}
