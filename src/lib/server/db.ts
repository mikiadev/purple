import { drizzle } from "drizzle-orm/bun-sqlite";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import * as schema from "./schemas";

import DB from "bun:sqlite";

const sqlite = new DB("db.sqlite");

export const db = drizzle(sqlite, { schema });

export type Database = typeof DB;

export const adapter = new DrizzleSQLiteAdapter(db, schema.sessions, schema.users);
