import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Promotion from './promotion.js'
import Demotion from './demotion.js'
import EmployeeRating from './employee_rating.js'
import PaySlip from './pay_slip.js'

export default class Employee extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string

  @column()
  declare prenom: string

  @column.date()
  declare dateNaissance: DateTime

  @column()
  declare contact: string

  @column()
  declare adresse: string

  @column()
  declare poste: string

  @column()
  declare departement: string

  @column.date()
  declare datePriseFonction: DateTime

  @column()
  declare salaire: number

  @column()
  declare typeContrat: 'CDD' | 'CDI' | 'Intérim' | 'Contrat d\'Essai' | 'Stage' | 'Consultant'

  @column()
  declare dureeContrat: number

  @column.date()
  declare dateFinContrat: DateTime | null

  @column()
  declare cvPath: string | null

  @column()
  declare actif: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Promotion)
  declare promotions: HasMany<typeof Promotion>

  @hasMany(() => Demotion)
  declare demotions: HasMany<typeof Demotion>

  @hasMany(() => EmployeeRating)
  declare ratings: HasMany<typeof EmployeeRating>

  @hasMany(() => PaySlip)
  declare paySlips: HasMany<typeof PaySlip>

  get fullName() {
    return `${this.prenom} ${this.nom}`
  }
}
