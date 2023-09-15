import { Kysely, Transaction } from "../../deps.ts";
import { ChatMemberInsert, Database } from "../schema.ts";

export class ChatMemberRepository {
  constructor(private readonly db: Kysely<Database>) {}

  protected get baseInsert() {
    return this.db.insertInto("chat_members").returningAll();
  }

  protected baseTrxInsert(trx: Transaction<Database>) {
    return trx.insertInto("chat_members").returningAll();
  }

  public insert(data: ChatMemberInsert, trx?: Transaction<Database>) {
    return (trx ? this.baseTrxInsert(trx) : this.baseInsert).values(data).execute();
  }
}
