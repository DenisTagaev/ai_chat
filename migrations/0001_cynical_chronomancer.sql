CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"title" text DEFAULT 'New Chat' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "chat_sessions_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "user_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_user_id_users_user_id_fk";
--> statement-breakpoint
DROP INDEX "user_idx";--> statement-breakpoint
DROP INDEX "created_at_idx";--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "user_chat_session_idx" ON "chat_sessions" USING btree ("user_id","chat_id");--> statement-breakpoint
CREATE INDEX "chat_session_idx" ON "chat_sessions" USING btree ("chat_id");--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_chat_id_chat_sessions_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat_sessions"("chat_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "chat_idx" ON "chats" USING btree ("chat_id");