import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'

export default class Promotion extends BaseModel {
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
  declare montantAugmentation: number

  @column.date()
  declare dateVigueur: DateTime

  @column()
  declare statut: 'En attente' | 'Appliquée' | 'Annulée'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}