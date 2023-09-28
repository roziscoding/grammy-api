import { Generated, Insertable, Selectable, Updateable } from "../deps.ts";

export interface BotTable {
  id: Generated<number>;
  token: string;
  webhook: string;
}

export type BotRecord = Selectable<BotTable>;
export type BotInsert = Insertable<BotTable>;
export type BotUpdate = Updateable<BotTable>;

export interface ChatTable {
  id: number;
  botId: number;
  type: "private" | "group" | "supergroup" | "channel";
  data: string;
}

export type ChatRecord = Selectable<ChatTable>;
export type ChatInsert = Insertable<ChatTable>;
export type ChatUpdate = Updateable<ChatTable>;

export interface UserTable {
  id: number;
  botId: number;
  data: string;
}

export type UserRecord = Selectable<UserTable>;
export type UserInsert = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface ChatMemberTable {
  id: Generated<number>;
  status: "creator" | "administrator" | "member" | "restricted" | "left" | "kicked";
  botId: number;
  chatId: number;
  userId: number;
  data: string;
}

export type ChatMemberRecord = Selectable<ChatMemberTable>;
export type ChatMemberInsert = Insertable<ChatMemberTable>;
export type ChatMemberUpdate = Updateable<ChatMemberTable>;

export interface BroadcastTable {
  id: Generated<number>;
  lastFinishedId: number;
  status: "running" | "error" | "waiting" | "done" | "idle";
  lastErrorBody: string;
  botId: number;
  createdAt: Generated<Date>;
  startedAt: Date | null;
  finishedAt: Date | null;
}

export type BroadcastRecord = Selectable<BroadcastTable>;
export type BroadcastInsert = Insertable<BroadcastTable>;
export type BroadcastUpdate = Updateable<BroadcastTable>;

export interface Database {
  bots: BotTable;
  chats: ChatTable;
  users: UserTable;
  chat_members: ChatMemberTable;
  broadcasts: BroadcastTable;
}
