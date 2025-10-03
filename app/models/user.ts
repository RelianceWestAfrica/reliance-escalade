import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import RwaCountry from './rwa_country.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare prenom: string

  @column()
  declare email: string

  @column()
  declare role: 'DRH' | 'DG' | 'Admin'

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare actif: boolean

  @column()
  declare rwaCountryId: number | null

  // @column()
  // declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => RwaCountry, {
    foreignKey: 'rwaCountryId',
  })
  declare rwaCountry: BelongsTo<typeof RwaCountry>

  // @belongsTo(() => User, {
  //   foreignKey: 'userId',
  // })
  // declare user: BelongsTo<typeof User>

  get fullName() {
    return `${this.prenom} ${this.nom}`
  }
}
