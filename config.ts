import "https://deno.land/std@0.201.0/dotenv/load.ts";
import { z } from "./deps.ts";

const Config = z.object({
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_MAX_CONNECTIONS: z.coerce.number(),
  DB_LOG: z.preprocess(
    (val) => typeof val === "string" ? val.split(",").map((s) => s.trim()) : [],
    z.array(z.enum(["query", "error"])),
  ).optional().default("error"),
}).transform((obj) => ({
  database: {
    name: obj.DB_NAME,
    user: obj.DB_USER,
    password: obj.DB_PASSWORD,
    host: obj.DB_HOST,
    port: obj.DB_PORT,
    maxConnections: obj.DB_MAX_CONNECTIONS,
    log: obj.DB_LOG,
  },
}));

export type Config = z.infer<typeof Config>;

export const config = Config.parse(Deno.env.toObject());
