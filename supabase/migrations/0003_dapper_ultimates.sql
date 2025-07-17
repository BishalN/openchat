ALTER TABLE "sources" ALTER COLUMN "agent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sourcesUserIdIdx" ON "sources" USING btree ("user_id");