import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add rwa_country_id and user_id to all tables
    const tables = [
      'users', 'employees', 'posts', 'promotions', 'demotions',
      'pay_slips', 'employee_ratings', 'employee_trackings',
      'organizational_charts', 'job_offers', 'job_applications'
    ]

    for (const tableName of tables) {
      this.schema.alterTable(tableName, (table) => {
        table.integer('rwa_country_id').unsigned().nullable().references('id').inTable('rwa_countries')

        // Don't add user_id to users table (would be circular)
        if (tableName !== 'users') {
          table.integer('user_id').unsigned().nullable().references('id').inTable('users')
        }
      })
    }
  }

  async down() {
    const tables = [
      'users', 'employees', 'posts', 'promotions', 'demotions',
      'pay_slips', 'employee_ratings', 'employee_trackings',
      'organizational_charts', 'job_offers', 'job_applications'
    ]

    for (const tableName of tables) {
      this.schema.alterTable(tableName, (table) => {
        table.dropColumn('rwa_country_id')

        if (tableName !== 'users') {
          table.dropColumn('user_id')
        }
      })
    }
  }
}
