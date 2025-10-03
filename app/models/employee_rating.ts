import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'
import RwaCountry from './rwa_country.js'
import User from './user.js'

export default class EmployeeRating extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare mois: string

  @column()
  declare annee: number

  @column()
  declare note: number

  @column()
  declare commentaire: string | null

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
