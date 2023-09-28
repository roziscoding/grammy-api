import { Kysely } from "../../deps.ts";
import { Database, UserTable } from "../schema.ts";
import { BaseRepository } from "./base.ts";

export class UserRepository extends BaseRepository<UserTable, "users"> {
  constructor(db: Kysely<Database>) {
    super(db, "users");
  }
}
