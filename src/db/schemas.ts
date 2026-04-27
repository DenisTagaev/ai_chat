import { pgTable, serial, varchar, text, AnyPgColumn, index, uniqueIndex, PgTableWithColumns } from "drizzle-orm/pg-core";
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
    uniqueIndex("email_idx").on(table.email),
  ]
);

export const chatsSessions: PgTableWithColumns<any> = pgTable(
  "chat_sessions",
  {
    id: serial("id").primaryKey(),
    chatId: varchar("chat_id", { length: 256 }).notNull().unique(),

    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references((): AnyPgColumn => users.userId, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),

      title: text("title").notNull().default("New Chat"),
    ...timestamps,
  },
  (table) => [
    index("user_chat_session_idx").on(table.userId, table.chatId),
    index("chat_session_idx").on(table.chatId)
  ]
);

export const chats: PgTableWithColumns<any> = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),
    chatId: varchar("chat_id", { length: 256 })
      .notNull()
      .references((): AnyPgColumn => chatsSessions.chatId, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),

    message: text("message").notNull(),
    reply: text("reply").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    index("chat_idx").on(table.chatId),
  ]
);


//Type inference for Drizzle queries
export type ChatInsert = typeof chats.$inferInsert
export type ChatSelect = typeof chats.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type ChatSessionInsert = typeof chatsSessions.$inferInsert;
export type ChatSessionSelect = typeof chatsSessions.$inferSelect;