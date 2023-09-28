import { Insertable, Kysely, Transaction, Updateable } from "../../deps.ts";
import { Database } from "../schema.ts";

export class BaseRepository<TTable, TTableName extends keyof Database> {
  constructor(protected readonly db: Kysely<Database>, private readonly table: TTableName) {}

  protected get baseSelect() {
    return this.db.selectFrom(this.table).selectAll();
  }

  protected get baseDelete() {
    return this.db.deleteFrom(this.table).returningAll();
  }

  protected get baseUpdate() {
    return this.db.updateTable(this.table).returningAll();
  }

  protected get baseInsert() {
    return this.db.insertInto(this.table).returningAll();
  }

  protected baseTrxInsert(trx: Transaction<Database>) {
    return trx.insertInto(this.table).returningAll();
  }

  public findById(id: number) {
    return this.baseSelect.where("id", "=", id as any).limit(1).executeTakeFirstOrThrow();
  }

  public insert(data: Insertable<TTable>, trx?: Transaction<Database>) {
    return (trx ? this.baseTrxInsert(trx) : this.baseInsert).values(data as any).executeTakeFirstOrThrow();
  }

  public updateById(id: number, data: Updateable<TTable>) {
    return this.baseUpdate.set(data as any).where("id", "=", id as any).execute();
  }

  public deleteById(id: number) {
    return this.baseDelete.where("id", "=", id as any).execute();
  }
}
