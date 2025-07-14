ALTER TABLE "agents" ALTER COLUMN "credit_usage" SET DEFAULT '{"totalTokensUsed":0,"lastResetDate":"2025-04-20T09:25:08.903Z","monthlyTokensUsed":0}'::json;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "stripe_product_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "plan_name" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "subscription_status" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_stripe_customer_id_unique" UNIQUE("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");