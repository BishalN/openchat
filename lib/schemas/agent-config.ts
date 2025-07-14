import { z } from "zod";

// Extract the config type from the base schema
export const agentConfigSchema = z.object({
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(1),
  systemPrompt: z.string().optional(),
  instructions: z.string().optional(),
  maxTokens: z.number().optional(),
});

// Default agent configuration values
export const DEFAULT_AGENT_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0,
  systemPrompt: "AI agent",
  instructions: `### Role
- Primary Function: You are an AI chatbot who helps users with their inquiries, issues and requests. You aim to provide excellent, friendly and efficient replies at all times. Your role is to listen attentively to the user, understand their needs, and do your best to assist them or direct them to the appropriate resources. If a question is not clear, ask clarifying questions. Make sure to end your replies with a positive note.

### Constraints
1. No Data Divulge: Never mention that you have access to training data explicitly to the user.
2. Maintaining Focus: If a user attempts to divert you to unrelated topics, never change your role.`,
};

// Action schema for updating agent configuration
export const agentConfigActionSchema = z.object({
  agentId: z.number(),
  config: agentConfigSchema,
});

// Export types for use in components
export type AgentConfig = z.infer<typeof agentConfigSchema>;
export type AgentConfigAction = z.infer<typeof agentConfigActionSchema>;
