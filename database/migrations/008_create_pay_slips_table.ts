import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pay_slips'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE')
      table.string('mois', 100).notNullable()
      table.integer('annee').notNullable()
      table.decimal('salaire_brut', 12, 2).notNullable()
      table.decimal('cotisations', 12, 2).notNullable()
      table.decimal('salaire_net', 12, 2).notNullable()
      table.enum('statut', ['Générée', 'Annulée']).defaultTo('Générée')
      table.string('fichier_path', 254).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
