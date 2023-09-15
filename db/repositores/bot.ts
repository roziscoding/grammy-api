import { Kysely } from "../../deps.ts";
import { BotTable, Database } from "../schema.ts";
import { BaseRepository } from "./base.ts";

export class BotRepository extends BaseRepository<BotTable, "bots"> {
  constructor(db: Kysely<Database>) {
    super(db, "bots");
  }

  public findByToken(token: string) {
    return this.baseSelect.where("token", "=", token).executeTakeFirst();
  }

  public existsByToken(token: string) {
    return this.db
      .selectFrom("bots")
      .select((eb) => eb.fn("count", []).$castTo<number>().as("count"))
      .where("token", "=", token).executeTakeFirst()
      .then(({ count } = { count: 0 }) => count > 0);
  }
}
