import { Kysely } from "../../deps.ts";
import { ChatTable, Database } from "../schema.ts";
import { BaseRepository } from "./base.ts";
import { Chat } from "../../schemas.ts";

export class ChatRepository extends BaseRepository<ChatTable, "chats"> {
  constructor(db: Kysely<Database>) {
    super(db, "chats");
  }

  public findByBotAndId(botId: number, id: number) {
    return this.baseSelect
      .where("botId", "=", botId)
      .where("id", "=", id)
      .limit(1)
      .executeTakeFirst();
  }

  public findIdsByTypes(botId: number, chatTypes: Chat["type"][], lastFinishedId?: number) {
    let query = this.db.selectFrom("chats").select("id");
    if (lastFinishedId) query = query.where("id", ">", lastFinishedId);
    return query
      .where("botId", "=", botId)
      .where("type", "in", chatTypes)
      .execute()
      .then((rows) => rows.map((row) => row.id));
  }
}
