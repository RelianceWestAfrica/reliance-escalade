import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_offers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pays').nullable().defaultTo('Togo')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pays')
    })
  }
}
