import { Kysely, sql } from "../../deps.ts";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("broadcasts")
    .addColumn("chatTypes", "jsonb", (col) => col.notNull().defaultTo(sql`'[]'`))
    .addColumn("waitUntil", "timestamp")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("broadcasts")
    .dropColumn("chatTypes")
    .dropColumn("waitUntil")
    .execute();
}
