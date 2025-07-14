ALTER TABLE "agents" ALTER COLUMN "credit_usage" SET DEFAULT '{"totalTokensUsed":0,"lastResetDate":"2025-04-22T05:06:05.263Z","monthlyTokensUsed":0}'::json;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "id" SET DATA TYPE varchar(21);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "conversation_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "credits" SET DEFAULT 5;