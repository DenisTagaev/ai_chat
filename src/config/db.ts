import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";

config({ path: '.env'});

if(!process.env.DB_CONNECTION) {
  throw new Error('Database connection issue');
}

//Connect Neon db
const sqlClient: NeonQueryFunction<false, false> = neon(
  process.env.DB_CONNECTION
);

//initialize drizzle
export const db = drizzle({client: sqlClient});