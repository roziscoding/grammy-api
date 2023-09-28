import { Kysely } from "../../deps.ts";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("bots")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("token", "varchar", (col) => col.notNull().unique())
    .addColumn("webhook", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("bot_token_index")
    .on("bots")
    .column("token")
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("bots").execute();
}
