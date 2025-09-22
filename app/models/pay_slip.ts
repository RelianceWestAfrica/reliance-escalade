import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'

export default class PaySlip extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare mois: string

  @column()
  declare annee: number

  @column()
  declare salaireBrut: number

  @column()
  declare cotisations: number

  @column()
  declare salaireNet: number

  @column()
  declare statut: 'Générée' | 'Annulée'

  @column()
  declare fichierPath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}