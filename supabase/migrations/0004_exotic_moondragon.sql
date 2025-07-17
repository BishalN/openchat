ALTER TABLE "sources" DROP CONSTRAINT "sources_user_id_profiles_id_fk";
--> statement-breakpoint
DROP INDEX "sourcesUserIdIdx";--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "agent_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" DROP COLUMN "user_id";