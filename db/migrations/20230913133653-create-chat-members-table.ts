import { Kysely } from "../../deps.ts";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("chat_members")
    .addColumn("id", "serial", (col) => col.notNull())
    .addColumn("status", "varchar", (col) => col.notNull())
    .addColumn("botId", "integer", (col) => col.notNull().references("bots.id").onDelete("cascade"))
    .addColumn("chatId", "double precision", (col) => col.notNull())
    .addColumn("userId", "double precision", (col) => col.notNull())
    .addColumn("data", "jsonb", (col) => col.notNull())
    .addForeignKeyConstraint("chat_members_chats_fk", ["botId", "chatId"], "chats", ["botId", "id"])
    .addForeignKeyConstraint("chat_members_users_fk", ["botId", "userId"], "users", ["botId", "id"])
    .addPrimaryKeyConstraint("chat_members_pkey", ["botId", "chatId", "userId"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("chat_members").execute();
}
