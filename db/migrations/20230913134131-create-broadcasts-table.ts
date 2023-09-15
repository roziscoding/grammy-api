import { Kysely, sql } from "../../deps.ts";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("broadcasts")
    .addColumn("id", "serial", (col) => col.notNull().primaryKey())
    .addColumn("lastFinishedId", "double precision", (col) => col.notNull().defaultTo(0))
    .addColumn("status", "varchar", (col) => col.notNull())
    .addColumn("lastErrorBody", "varchar", (col) => col.notNull())
    .addColumn("createdAt", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("startedAt", "timestamp")
    .addColumn("finishedAt", "timestamp")
    .addColumn("botId", "integer", (col) => col.notNull().references("bots.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createIndex("broadcast_bot_id_index")
    .on("broadcasts")
    .column("botId")
    .execute();

  await db.schema
    .createIndex("broadcast_status_index")
    .on("broadcasts")
    .column("status")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("broadcasts").execute();
}
