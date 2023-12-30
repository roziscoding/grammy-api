import { Kysely } from "../../deps.ts";
import { BroadcastTable, Database } from "../schema.ts";
import { BaseRepository } from "./base.ts";

export class BroadcastRepository extends BaseRepository<BroadcastTable, "broadcasts"> {
  constructor(db: Kysely<Database>) {
    super(db, "broadcasts");
  }

  public findByBotId(botId: number) {
    return this.baseSelect.where("botId", "=", botId).execute();
  }

  public markStarted(id: number) {
    return this.db.updateTable("broadcasts")
      .set((eb) => ({ status: "running", startedAt: eb.fn("now", []) }))
      .where("id", "=", id).execute();
  }

  public markFinished(id: number) {
    return this.db.updateTable("broadcasts")
      .set((eb) => ({ status: "done", finishedAt: eb.fn("now", []) }))
      .where("id", "=", id).execute();
  }

  public findResumable() {
    return this.db.selectFrom("broadcasts")
      .innerJoin("bots", "botId", "bots.id")
      .select([
        "broadcasts.id",
        "chatTypes",
        "createdAt",
        "startedAt",
        "finishedAt",
        "status",
        "broadcasts.botId",
        "lastFinishedId",
        "lastErrorBody",
        "waitUntil",
        "bots.webhook as botWebhook",
      ])
      .where("status", "in", ["waiting", "idle", "running"])
      .execute();
  }
}
