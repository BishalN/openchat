ALTER TABLE "messages" ALTER COLUMN "role" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "parts" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "content";--> statement-breakpoint
DROP TYPE "public"."agent_role";