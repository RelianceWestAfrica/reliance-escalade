import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_offers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('intitule', 254).notNullable()
      table.string('poste', 254).notNullable()
      table.string('departement', 254).notNullable()
      table.enum('type_contrat', ['CDI', 'CDD', 'Stage', 'Consultant', 'Intérim']).notNullable()
      table.text('competences_requises').notNullable()
      table.date('date_cloture').notNullable()
      table.enum('statut', ['Publiée', 'Non publiée', 'Expirée', 'Pourvue']).defaultTo('Non publiée')
      table.text('description').nullable()
      table.decimal('salaire', 12, 2).nullable()
      table.text('experience').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
