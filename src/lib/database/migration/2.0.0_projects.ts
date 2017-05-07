/**
 * houston/src/lib/database/migration/2.0.0_projects.ts
 * The inital houston 2.0.0 migration for projects table
 *
 * @exports {Function} up - Database information for upgrading to version 2.0.0
 * @exports {Function} down - Database information for downgrading version 2.0.0
 */

/**
 * up
 * Database information for upgrading to version 2.0.0
 *
 * @param {Object} knex - An initalized Knex package
 * @return {Promise} - A promise of database migration
 */
export function up (knex) {
  return knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary()

    table.string('name_domain').index()
    table.string('name_human')
    table.string('name_developer')

    table.enu('type', ['application'])

    table.uuid('projectable_id')
    table.string('projectable_type')

    table.uuid('stripe_id')

    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').onUpdate(knex.fn.now())
    table.timestamp('deleted_at').nullable()
  })
}

/**
 * down
 * Database information for downgrading version 2.0.0
 *
 * @param {Object} knex - An initalized Knex package
 * @return {Promise} - A promise of successful database migration
 */
export function down (knex) {
  return knex.schema.dropTable('projects')
}
