import { Kysely } from "../../deps.ts";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "double precision", (col) => col.notNull())
    .addColumn("botId", "integer", (col) => col.notNull().references("bots.id").onDelete("cascade"))
    .addColumn("data", "jsonb", (col) => col.notNull())
    .addPrimaryKeyConstraint("users_pkey", ["id", "botId"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
