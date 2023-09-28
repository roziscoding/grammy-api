import { Kysely } from "../../deps.ts";
import { BroadcastTable, Database } from "../schema.ts";
import { BaseRepository } from "./base.ts";

export class BroadcastRepository extends BaseRepository<BroadcastTable, "broadcasts"> {
  constructor(db: Kysely<Database>) {
    super(db, "broadcasts");
  }

  private get select() {
    return this.db.selectFrom("broadcasts").select([
      "id",
      "lastFinishedId",
      "status",
      "lastErrorBody",
      "createdAt",
      "startedAt",
      "finishedAt",
    ]);
  }

  public findByBotId(botId: number) {
    return this.select.where("botId", "=", botId).execute();
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
}
