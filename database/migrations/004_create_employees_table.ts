import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nom', 100).notNullable()
      table.string('prenom', 254).notNullable()
      table.date('date_naissance').notNullable()
      table.string('contact', 100).notNullable()
      table.text('adresse').notNullable()
      table.string('poste', 254).notNullable()
      table.string('departement', 254).notNullable()
      table.date('date_prise_fonction').notNullable()
      table.decimal('salaire', 12, 2).notNullable()
      table.enum('type_contrat', ['CDD', 'CDI', 'Intérim', "Contrat d\\'Essai", 'Stage', 'Consultant']).notNullable()
      table.integer('duree_contrat').defaultTo(0)
      table.date('date_fin_contrat').nullable()
      table.string('cv_path', 254).nullable()
      table.boolean('actif').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
