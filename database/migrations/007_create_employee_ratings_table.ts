import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_ratings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE')
      table.string('mois', 100).notNullable()
      table.integer('annee').notNullable()
      table.decimal('note', 3, 1).notNullable() // Note sur 7
      table.text('commentaire').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
