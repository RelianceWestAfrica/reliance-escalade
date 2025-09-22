import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'promotions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE')
      table.string('ancien_poste', 254).notNullable()
      table.string('nouveau_poste', 254).notNullable()
      table.decimal('ancien_salaire', 12, 2).notNullable()
      table.decimal('nouveau_salaire', 12, 2).notNullable()
      table.decimal('montant_augmentation', 12, 2).notNullable()
      table.date('date_vigueur').notNullable()
      table.enum('statut', ['En attente', 'Appliquée', 'Annulée']).defaultTo('En attente')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
