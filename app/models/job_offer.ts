import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import JobApplication from './job_application.js'
import RwaCountry from './rwa_country.js'
import User from './user.js'

export default class JobOffer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare intitule: string

  @column()
  declare poste: string

  @column()
  declare departement: string

  @column()
  declare typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Consultant' | 'Intérim'

  @column()
  declare competencesRequises: string

  @column.date()
  declare dateCloture: DateTime

  @column()
  declare statut: 'Publiée' | 'Non publiée' | 'Expirée' | 'Pourvue'

  @column()
  declare description: string | null

  @column()
  declare salaire: number | null

  @column()
  declare experience: string | null

  @column()
  declare pays: string | null

  @column()
  declare rwaCountryId: number | null

  @column()
  declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => JobApplication)
  declare applications: HasMany<typeof JobApplication>

  @belongsTo(() => RwaCountry, {
    foreignKey: 'rwaCountryId',
  })
  declare rwaCountry: BelongsTo<typeof RwaCountry>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  // Computed property to check if offer is expired
  get isExpired() {
    return this.dateCloture < DateTime.now()
  }

  // Auto-update status based on date
  async updateStatus() {
    if (this.isExpired && this.statut === 'Publiée') {
      this.statut = 'Expirée'
      await this.save()
    }
  }
}
