import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import RwaCountry from './rwa_country.js'
import User from './user.js'

export default class OrganizationalChart extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare description: string | null

  @column()
  declare structure: any // JSON structure

  @column()
  declare actif: boolean

  @column()
  declare rwaCountryId: number | null

  @column()
  declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => RwaCountry, {
    foreignKey: 'rwaCountryId',
  })
  declare rwaCountry: BelongsTo<typeof RwaCountry>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}
