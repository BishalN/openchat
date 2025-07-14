ALTER TABLE "agents" ADD COLUMN "credit_limit" integer DEFAULT 1000000 NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "credit_usage" json DEFAULT '{"totalTokensUsed":0,"lastResetDate":"2025-04-18T11:02:25.833Z","monthlyTokensUsed":0}'::json;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "is_credits_limit_enabled" boolean DEFAULT true;