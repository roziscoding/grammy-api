export { sql } from "../deps.ts";
import { config } from "../config.ts";
import { Kysely, Pool, PostgresDialect } from "../deps.ts";
import {
  BotRepository,
  BroadcastRepository,
  ChatMemberRepository,
  ChatRepository,
  UserRepository,
} from "./repositores/mod.ts";
import { Database } from "./schema.ts";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: config.database.name,
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    max: config.database.maxConnections,
  }),
});

export const db = new Kysely<Database>({
  log: config.database.log,
  dialect,
});

export const repositories = {
  bots: new BotRepository(db),
  users: new UserRepository(db),
  chats: new ChatRepository(db),
  chatMembers: new ChatMemberRepository(db),
  broadcasts: new BroadcastRepository(db),
};

export type Repositories = typeof repositories;
