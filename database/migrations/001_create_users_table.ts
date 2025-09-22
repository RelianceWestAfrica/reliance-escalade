import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nom', 100).notNullable()
      table.string('prenom', 254).notNullable()
      table.string('email', 254).notNullable().unique()
      table.enum('role', ['DRH', 'DG', 'Admin']).notNullable()
      table.string('password', 254).notNullable()
      table.boolean('actif').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
