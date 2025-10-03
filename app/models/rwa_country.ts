import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Employee from './employee.js'
import Demotion from './demotion.js'
import Promotion from './promotion.js'
import Post from './post.js'
import PaySlip from './pay_slip.js'
import EmployeeTracking from './employee_tracking.js'
import OrganizationalChart from './organizational_chart.js'
import JobOffer from './job_offer.js'

export default class RwaCountry extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare rwaInstanceName: string

  @column()
  declare instanceCountry: string

  @column()
  declare accessCode: string

  @column()
  declare instanceCeo: string

  @column()
  declare actif: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => Employee)
  declare employees: HasMany<typeof Employee>

  @hasMany(() => Demotion)
  declare demotions: HasMany<typeof Demotion>

  @hasMany(() => Promotion)
  declare promotions: HasMany<typeof Promotion>

  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>

  @hasMany(() => PaySlip)
  declare paySlips: HasMany<typeof PaySlip>

  @hasMany(() => EmployeeTracking)
  declare trackings: HasMany<typeof EmployeeTracking>

  @hasMany(() => OrganizationalChart)
  declare orgcharts: HasMany<typeof OrganizationalChart>

  @hasMany(() => JobOffer)
  declare jobOffers: HasMany<typeof JobOffer>
}
