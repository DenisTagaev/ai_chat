import { pgTable, serial, varchar, text, index, PgTableWithColumns } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

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
  ]
);

export const chatsSessions: PgTableWithColumns<any> = pgTable(
  "chat_sessions",
  {
    id: serial("id").primaryKey(),
    chatId: varchar("chat_id", { length: 256 }).notNull().unique(),

    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => users.userId, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),

      title: text("title").notNull().default("New Chat"),
    ...timestamps,
  },
  (table) => [
    index("chat_sessions_updated_at_idx").on(table.userId, table.updatedAt.desc()),
  ]
);

export const chats: PgTableWithColumns<any> = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),
    chatId: varchar("chat_id", { length: 256 })
      .notNull()
      .references(() => chatsSessions.chatId, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),

    message: text("message").notNull(),
    reply: text("reply").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    index("chat_created_at_idx").on(table.chatId, table.createdAt.desc()),
  ]
);


//Type inference for Drizzle queries
export type ChatInsert = typeof chats.$inferInsert
export type ChatSelect = typeof chats.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type ChatSessionInsert = typeof chatsSessions.$inferInsert;
export type ChatSessionSelect = typeof chatsSessions.$inferSelect;