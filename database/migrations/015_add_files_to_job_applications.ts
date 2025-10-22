import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_applications'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cv_file_path').nullable()
      table.string('lettre_motivation_file_path').nullable()
      table.string('diplome_file_path').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cv_file_path')
      table.dropColumn('lettre_motivation_file_path')
      table.dropColumn('diplome_file_path')
    })
  }
}
