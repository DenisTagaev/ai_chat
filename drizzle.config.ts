import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

const dbUrl: string | undefined = process.env.DB_CONNECTION;
if (!dbUrl) throw new Error("Database connection issue");

export default defineConfig({
  schema: "./src/db/schemas.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
