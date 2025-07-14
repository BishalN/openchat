import { db } from "@/drizzle";
import {
  conversationsTable,
  messagesTable,
  profilesTable,
} from "@/drizzle/schema";
import { google } from "@ai-sdk/google";
import { and, eq, sql } from "drizzle-orm";

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: 'http://127.0.0.1:1234/v1',
});
export const lmGemmaModel = lmstudio("google/gemma-3-12b");

// Helper to select the correct model provider based on the model string
export function selectModel(model: string) {
  // This is a simplified example - you'd need to implement the actual model selection logic
  // based on your available providers
  if (model.startsWith("gemini")) {
    return google(model);
  }

  // Default to gemini for now - you'd expand this with other providers
  return google("gemini-2.5-pro-exp-03-25");
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

// Helper functions
export async function handleConversation(
  agentId: string,
  userId: string,
  message: any,
  existingId?: string
) {
  if (!existingId) {
    // Create new conversation
    const [newConversation] = await db
      .insert(conversationsTable)
      .values({
        agentId: parseInt(agentId),
        userId: userId,
        title: message.content.substring(0, 50) + "...",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newConversation.id.toString();
  }

  // Check if conversation exists
  const [conversation] = await db
    .select({ id: conversationsTable.id })
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, parseInt(existingId)),
        eq(conversationsTable.agentId, parseInt(agentId))
      )
    )
    .limit(1);

  if (conversation) {
    // Update timestamp
    await db
      .update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, parseInt(existingId)));

    return existingId;
  }

  // Create new conversation if not found
  const [newConversation] = await db
    .insert(conversationsTable)
    .values({
      agentId: parseInt(agentId),
      userId: userId,
      id: parseInt(existingId),
      title: message.content.substring(0, 50) + "...",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newConversation.id.toString();
}

export async function storeMessage(
  conversationId: string,
  role: string,
  content: string
) {
  await db.insert(messagesTable).values({
    conversationId: parseInt(conversationId),
    role,
    content,
    createdAt: new Date(),
  });
}



