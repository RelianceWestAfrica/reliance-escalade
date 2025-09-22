import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'

export default class EmployeeTracking extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare typeEvenement: string

  @column.dateTime()
  declare dateHeure: DateTime

  @column()
  declare commentaire: string | null

  @column()
  declare lieu: string | null

  @column()
  declare statut: 'Actif' | 'Terminé' | 'Annulé'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}
