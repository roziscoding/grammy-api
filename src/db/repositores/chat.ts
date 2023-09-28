import { Kysely } from "../../deps.ts";
import { ChatTable, Database } from "../schema.ts";
import { BaseRepository } from "./base.ts";
import { Chat } from "../../schemas.ts";

export class ChatRepository extends BaseRepository<ChatTable, "chats"> {
  constructor(db: Kysely<Database>) {
    super(db, "chats");
  }

  public findIdsByTypes(chatTypes: Chat["type"][]) {
    return this.db.selectFrom("chats").select("id").where("type", "in", chatTypes).execute().then((rows) =>
      rows.map((row) => row.id)
    );
  }
}
