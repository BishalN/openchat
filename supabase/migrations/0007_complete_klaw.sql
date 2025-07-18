CREATE TABLE "custom_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"when_to_use" text NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_actions" ADD CONSTRAINT "custom_actions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customActionsAgentIdIdx" ON "custom_actions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "customActionsActiveIdx" ON "custom_actions" USING btree ("is_active");