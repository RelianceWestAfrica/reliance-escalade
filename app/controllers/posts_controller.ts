import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { DateTime } from 'luxon'
import { defineConfig } from '@adonisjs/core/bodyparser'


export default class PostsController {
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 20

    const posts = await Post.query()
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const totalPosts = await Post.query().count('* as total')

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('posts/index', {
      nposts: {
        totalPosts: totalPosts[0].$extras.total,

      },
      posts, currentDate})
  }

  async create({ view }: HttpContext) {

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('posts/create', { currentDate })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['intitule', 'departement', 'description'])
    await Post.create(data)

    session.flash('success', 'Poste créé avec succès')
    return response.redirect('/posts')
  }

  async edit({ params, view }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    return view.render('posts/edit', { post })
  }

  async update({ params, request, response, session }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    const data = request.only(['intitule', 'departement', 'description'])

    post.merge(data)
    await post.save()

    session.flash('success', 'Poste modifié avec succès')
    return response.redirect('/posts')
  }

  async show({ params, view }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    return view.render('posts/show', { post })
  }


  async destroy({ params, response, session }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    await post.delete()

    session.flash('success', 'Poste supprimé avec succès')
    return response.redirect('/posts')
  }
}
