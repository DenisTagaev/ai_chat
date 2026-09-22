import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";

config({ path: '.env'});

const databaseUrl: string | undefined = process.env.DB_CONNECTION;

if(!databaseUrl) {
  throw new Error("Database environment variable is not configured");
}

//Connect Neon db
const sqlClient = neon(databaseUrl);

//initialize drizzle
export const db = drizzle({client: sqlClient});