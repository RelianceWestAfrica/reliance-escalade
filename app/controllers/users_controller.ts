import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class UsersController {
  async index({ view, request, auth, response }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const page = request.input('page', 1)
    const limit = 10

    const users = await User.query()
      .where('rwa_country_id', rwaCountryId)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")

    return view.render('users/index', { users, currentDate })
  }

  async show({ params, view, auth, response }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const user = await User.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    return view.render('users/show', { user })
  }

  async create({ view }: HttpContext) {
    return view.render('users/create')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const data = request.only(['nom', 'prenom', 'email', 'role', 'password', 'rwa_country_id'])

    // Vérifier si l'email existe déjà dans le même pays RWA
    const existingUser = await User.query()
      .where('email', data.email)
      .where('rwa_country_id', rwaCountryId)
      .first()

    if (existingUser) {
      session.flash('error', 'Cet email est déjà utilisé')
      return response.redirect().back()
    }

    await User.create({
      ...data,
      rwaCountryId,
    })

    session.flash('success', 'Utilisateur créé avec succès')
    return response.redirect('/users')
  }

  async edit({ params, view, auth, response }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const user = await User.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    return view.render('users/edit', { user })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const user = await User.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    const data = request.only(['nom', 'prenom', 'email', 'role', 'password', 'rwa_country_id'])

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    if (data.email !== user.email) {
      const existingUser = await User.query()
        .where('email', data.email)
        .where('rwa_country_id', rwaCountryId)
        .first()

      if (existingUser) {
        session.flash('error', 'Cet email est déjà utilisé')
        return response.redirect().back()
      }
    }

    // Ne mettre à jour le mot de passe que s'il est fourni
    if (!data.password) {
      delete data.password
    }

    user.merge({
      ...data,
      rwaCountryId,
    })
    await user.save()

    session.flash('success', 'Utilisateur modifié avec succès')
    return response.redirect('/users')
  }

  async toggleStatus({ params, response, session, auth }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const user = await User.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    user.actif = !user.actif
    user.rwaCountryId = rwaCountryId
    await user.save()

    session.flash('success', `Utilisateur ${user.actif ? 'activé' : 'désactivé'} avec succès`)
    return response.redirect('/users')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const currentUser = auth.user
    if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

    const rwaCountryId = currentUser.rwaCountryId
    if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

    const user = await User.query()
      .where('id', params.id)
      .where('rwa_country_id', rwaCountryId)
      .firstOrFail()

    await user.delete()

    session.flash('success', 'Utilisateur supprimé avec succès')
    return response.redirect('/users')
  }
}




// import type { HttpContext } from '@adonisjs/core/http'
// import User from '#models/user'
// import hash from '@adonisjs/core/services/hash'
// import { DateTime } from 'luxon'

// export default class UsersController {
//   async index({ view, request }: HttpContext) {
//     const page = request.input('page', 1)
//     const limit = 10

//     const users = await User.query()
//       .orderBy('created_at', 'desc')
//       .paginate(page, limit)

//     const currentDate = DateTime.local().setLocale('fr').toFormat("cccc d LLLL yyyy")


//     return view.render('users/index', { users, currentDate })
//   }

//   async show({ params, view }: HttpContext) {
//     const user = await User.findOrFail(params.id)
//     return view.render('users/show', { user })
//   }

//   async create({ view }: HttpContext) {
//     return view.render('users/create')
//   }

//   async store({ request, response, session, auth }: HttpContext) {
//     const currentUser = auth.user
//     if (!currentUser) return response.unauthorized('Utilisateur non authentifié')

//     const rwaCountryId = currentUser.rwaCountryId
//     if (!rwaCountryId) return response.badRequest('Code pays non défini pour cet utilisateur')

//     const data = request.only(['nom', 'prenom', 'email', 'role', 'password', 'rwa_country_id'])

//    // Vérifier si l'email existe déjà dans le même pays RWA
//     const existingUser = await User.query()
//       .where('email', data.email)
//       .where('rwa_country_id', rwaCountryId)
//       .first()

//     if (existingUser) {
//       session.flash('error', 'Cet email est déjà utilisé')
//       return response.redirect().back()
//     }

//     await User.create({
//       ...data,
//       rwaCountryId,
//     })

//     session.flash('success', 'Utilisateur créé avec succès')
//     return response.redirect('/users')

//   }

//   async edit({ params, view }: HttpContext) {
//     const user = await User.findOrFail(params.id)
//     return view.render('users/edit', { user })
//   }

//   async update({ params, request, response, session }: HttpContext) {
//     const user = await User.findOrFail(params.id)
//     const data = request.only(['nom', 'prenom', 'email', 'role', 'password'])

//     // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
//     if (data.email !== user.email) {
//       const existingUser = await User.findBy('email', data.email)
//       if (existingUser) {
//         session.flash('error', 'Cet email est déjà utilisé')
//         return response.redirect().back()
//       }
//     }

//     // Ne mettre à jour le mot de passe que s'il est fourni
//     if (!data.password) {
//       delete data.password
//     }

//     user.merge(data)
//     await user.save()

//     session.flash('success', 'Utilisateur modifié avec succès')
//     return response.redirect('/users')
//   }

//   async toggleStatus({ params, response, session }: HttpContext) {
//     const user = await User.findOrFail(params.id)
//     user.actif = !user.actif
//     await user.save()

//     session.flash('success', `Utilisateur ${user.actif ? 'activé' : 'désactivé'} avec succès`)
//     return response.redirect('/users')
//   }

//   async destroy({ params, response, session }: HttpContext) {
//     const user = await User.findOrFail(params.id)
//     await user.delete()

//     session.flash('success', 'Utilisateur supprimé avec succès')
//     return response.redirect('/users')
//   }
// }
