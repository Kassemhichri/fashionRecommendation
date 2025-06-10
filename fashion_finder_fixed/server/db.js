import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('DATABASE_URL not set; using local database');
}
const connectionString = databaseUrl ?? '';
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
