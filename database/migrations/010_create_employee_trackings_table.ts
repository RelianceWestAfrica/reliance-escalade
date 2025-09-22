import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_trackings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE')
      table.string('type_evenement', 254).notNullable()
      table.datetime('date_heure').notNullable()
      table.text('commentaire').nullable()
      table.string('lieu', 254).nullable()
      table.enum('statut', ['Actif', 'Terminé', 'Annulé']).defaultTo('Actif')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
