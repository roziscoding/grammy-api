import { Kysely } from "../../deps.ts";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("chats")
    .addColumn("id", "double precision", (col) => col.notNull())
    .addColumn("botId", "integer", (col) => col.notNull().references("bots.id").onDelete("cascade"))
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("data", "jsonb", (col) => col.notNull())
    .addPrimaryKeyConstraint("chats_pkey", ["id", "botId"])
    .addUniqueConstraint("chats_bot_id_type_unique", ["id", "botId"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("chats").execute();
}
