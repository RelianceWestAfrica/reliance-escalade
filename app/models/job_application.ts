import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import JobOffer from './job_offer.js'

export default class JobApplication extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobOfferId: number

  @column()
  declare nomComplet: string

  @column()
  declare emailProfessionnel: string

  @column()
  declare telephone: string | null

  @column()
  declare motivation: string | null

  @column()
  declare statut: 'En attente' | 'Acceptée' | 'Refusée' | 'En cours'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => JobOffer)
  declare jobOffer: BelongsTo<typeof JobOffer>
}
