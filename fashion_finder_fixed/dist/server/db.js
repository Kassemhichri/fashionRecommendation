import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";
neonConfig.webSocketConstructor = ws;
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.warn('DATABASE_URL not set; using local database');
}
var connectionString = databaseUrl !== null && databaseUrl !== void 0 ? databaseUrl : '';
export var pool = new Pool({ connectionString: connectionString });
export var db = drizzle({ client: pool, schema: schema });
