import { pgTable, serial, varchar, text, AnyPgColumn, index, uniqueIndex, PgTableWithColumns } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

export const chats: PgTableWithColumns<any> = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references((): AnyPgColumn => users.userId, { onDelete: 'cascade', onUpdate: 'cascade'}),
    message: text("message").notNull(),
    reply: text("reply").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    index("user_idx").on(table.userId),
    uniqueIndex("created_at_idx").on(table.createdAt),
  ]
);

export const users: PgTableWithColumns<any> = pgTable(
  "users",
  {
    userId: varchar("user_id", { length: 256 }).primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    ...timestamps,
  },
  (table) => [
    index("name_idx").on(table.name),
    uniqueIndex("email_idx").on(table.email),
  ]
);

//Type inference for Drizzle queries
export type ChatInsert = typeof chats.$inferInsert
export type ChatSelect = typeof chats.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;