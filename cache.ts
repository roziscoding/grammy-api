import { BotRecord } from "./db/schema.ts";

export const botsCache = new Map<string, BotRecord>();
