import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rwa_countries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('rwa_instance_name', 254).notNullable()
      table.string('instance_country', 254).notNullable()
      table.string('access_code', 254).notNullable().unique()
      table.string('instance_ceo', 254).notNullable()
      table.boolean('actif').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
