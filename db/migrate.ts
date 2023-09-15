import { dirname, fromFileUrl, join } from "https://deno.land/std@0.199.0/path/mod.ts";
import { config } from "../config.ts";
import { FileMigrationProvider, Kysely, Migration, Migrator, Pool, PostgresDialect } from "../deps.ts";
import { Database } from "./schema.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const MIGRATIONS_FOLDER_PATH = join(__dirname, "migrations");

async function readdir(path: string) {
  const files = Deno.readDir(path);
  const fileNames: string[] = [];

  for await (const file of files) {
    fileNames.push(file.name);
  }

  return fileNames;
}

export class DenoFileMigrationProvider extends FileMigrationProvider {
  constructor() {
    super({
      fs: { readdir },
      path: { join },
      migrationFolder: MIGRATIONS_FOLDER_PATH,
    });
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await Deno.readDir(MIGRATIONS_FOLDER_PATH);

    for await (const file of files) {
      migrations[file.name] = await import(join(MIGRATIONS_FOLDER_PATH, file.name));
    }

    return migrations;
  }
}

async function migrateToLatest() {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        database: config.database.name,
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        port: config.database.port,
        max: config.database.maxConnections,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new DenoFileMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    Deno.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
