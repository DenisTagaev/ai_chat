import { pgTable, PgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable('chats', {
    id: serial('id'),primaryKey(),
    userId: text('user_id').notNull(),
    message: text('message').notNull(),
    reply: text('reply').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const users = pgTable('users', {
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
})