DROP INDEX "agentChatInterfaceConfigsAgentIdIdx";--> statement-breakpoint
ALTER TABLE "agent_chat_interface_configs" ADD CONSTRAINT "agentChatInterfaceConfigsAgentIdUnique" UNIQUE("agent_id");