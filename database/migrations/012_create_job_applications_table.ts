import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_applications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('job_offer_id').unsigned().references('id').inTable('job_offers').onDelete('CASCADE')
      table.string('nom_complet', 254).notNullable()
      table.string('email_professionnel', 254).notNullable()
      table.string('telephone', 254).nullable()
      table.text('motivation').nullable()
      table.enum('statut', ['En attente', 'Acceptée', 'Refusée', 'En cours']).defaultTo('En attente')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
