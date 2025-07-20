import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { appendResponseMessages, createDataStreamResponse, Message, streamText } from "ai";
import { z } from "zod";
import { AgentConfig, agentsTable, conversationsTable, Identity } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { upsertGuestConversation } from "@/drizzle/queries";
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config";
import { eq } from "drizzle-orm";
import { Langfuse } from "langfuse";
import crypto from "crypto";
import { createCustomActionTools } from "@/lib/ai/custom-actions";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const langfuse = new Langfuse({
  environment: process.env.NODE_ENV ?? "development",
});

function verifyIdentity(identity: Identity, secret_key: string) {
  const computedHash = crypto
    .createHmac("sha256", secret_key)
    .update(identity.user_id)
    .digest("hex");

  return computedHash === identity.user_hash;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      messages: Array<Message>;
      conversationId?: string;
      agentId: string;
      identity?: Identity;
    };

    const { messages, agentId, conversationId, identity } = body;
    if (!messages.length) {
      return new Response("No messages provided", { status: 400 });
    }

    // get the secret key from the agent
    const agent = await db.query.agentsTable.findFirst({
      where: eq(agentsTable.id, agentId),
    });
    if (!agent) {
      return new Response("Agent not found", { status: 404 });
    }
    const secretKey = agent.secretKey!;
    const config = agent.config as AgentConfig;

    // Verify the identity
    if (identity && !verifyIdentity(identity, secretKey)) {
      return new Response("Invalid identity", { status: 401 });
    }

    // If no conversationId is provided, create a new conversation with the user's message
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversationId = crypto.randomUUID();
      await upsertGuestConversation({
        conversationId: newConversationId,
        title: messages[messages.length - 1]!.content.slice(0, 50) + "...",
        messages: messages, // Only save the user's message initially
        agentId,
        identity
      });
      currentConversationId = newConversationId;
    } else {
      // Verify the conversation belongs to the user
      const conversation = await db.query.conversationsTable.findFirst({
        where: eq(conversationsTable.id, currentConversationId),
      });
      if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
      }
    }

    const trace = langfuse.trace({
      sessionId: currentConversationId,
      name: "chat",
    });

    // Create custom action tools with identity (if available)
    const customTools = await createCustomActionTools(agentId, trace, identity);
    console.log('Identity:', JSON.stringify(identity, null, 2));
    console.log('Custom tools:', Object.keys(customTools));

    return createDataStreamResponse({
      execute: async (dataStream) => {
        // If this is a new chat, send the chat ID to the frontend
        if (!conversationId) {
          dataStream.writeData({
            type: "NEW_CONVERSATION_CREATED",
            conversationId: currentConversationId,
          });
        }

        // Build system prompt with identity context if available
        let systemPrompt = config.systemPrompt ?? SYSTEM_PROMPT_DEFAULT;
        if (identity) {
          systemPrompt += `\n\nUser Identity Context:
- User ID: ${identity.user_id}
- User Hash: ${identity.user_hash}
- User Metadata: ${JSON.stringify(identity.user_metadata, null, 2)}

Use this identity information when interacting with custom tools that require user context.`;
        }

        const result = streamText({
          experimental_telemetry: {
            isEnabled: true,
            functionId: `public-chat`,
            metadata: {
              langfuseTraceId: trace.id,
            },
          },
          model: google(config.model ?? "gemini-2.0-flash"),
          messages,
          maxSteps: 10,
          system: systemPrompt,
          temperature: config.temperature ?? 0.4,
          tools: {
            getContext: {
              description: "Get the context from the db",
              parameters: z.object({
                question: z.string().describe("The question to get the context for, this is the last user message"),
              }),
              execute: async ({ question }) => {
                const context = await findRelevantContent(
                  question,
                  agentId
                );
                return context.map((c) => c.content).join(", ");
              },
            },
            ...customTools, // Add custom action tools
          },
          onFinish: async ({ response }) => {
            // Merge the existing messages with the response messages
            const updatedMessages = appendResponseMessages({
              messages,
              responseMessages: response.messages,
            });

            const lastMessage = messages[messages.length - 1];
            if (!lastMessage) {
              return;
            }

            // Save the complete chat history
            await upsertGuestConversation({
              conversationId: currentConversationId,
              title: lastMessage.content.slice(0, 50) + "...",
              messages: updatedMessages,
              agentId,
              identity,
            });
            await langfuse.flushAsync();
          },
        });

        result.mergeIntoDataStream(dataStream);
      },
      onError: (e) => {
        console.error(e);
        return "Oops, an error occurred!";
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
