import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'
import RwaCountry from './rwa_country.js'
import User from './user.js'

export default class Demotion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare ancienPoste: string

  @column()
  declare nouveauPoste: string

  @column()
  declare ancienSalaire: number

  @column()
  declare nouveauSalaire: number

  @column()
  declare montantReduction: number

  @column()
  declare motifDemotion: string

  @column.date()
  declare dateVigueur: DateTime

  @column()
  declare statut: 'En attente' | 'Appliquée' | 'Annulée'

  @column()
  declare rwaCountryId: number | null

  @column()
  declare userId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => RwaCountry, {
    foreignKey: 'rwaCountryId',
  })
  declare rwaCountry: BelongsTo<typeof RwaCountry>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}
