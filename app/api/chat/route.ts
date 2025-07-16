import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { appendResponseMessages, createDataStreamResponse, Message, streamText, ToolSet } from "ai";
import { z } from "zod";
import {
  conversationsTable,
} from "@/drizzle/schema";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";

import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config";
import { upsertConversation } from "@/drizzle/queries";
import { eq } from "drizzle-orm";
import { Langfuse } from "langfuse";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;


const langfuse = new Langfuse({
  environment: process.env.NODE_ENV ?? "development",
});

export async function POST(req: Request) {
  try {
    // Get the session to identify the user
    const supabaseClient = await createClient();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as {
      messages: Array<Message>;
      conversationId?: string;
      agentId: string;
    };

    // Create a trace for the conversation
    const trace = langfuse.trace({
      name: "chat",
      userId: user.id,
    });


    const { messages, agentId, conversationId } = body;
    if (!messages.length) {
      return new Response("No messages provided", { status: 400 });
    }
    // If no conversationId is provided, create a new conversation with the user's message
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversationId = crypto.randomUUID();
      const createConversationSpan = trace.span({
        name: "create-conversation",
        input: {
          userId: user.id,
          conversationId: newConversationId,
          title: messages[messages.length - 1]!.content.slice(0, 50) + "...",
          messages,
          agentId,
        },
      });
      await upsertConversation({
        userId: user.id,
        conversationId: newConversationId,
        title: messages[messages.length - 1]!.content.slice(0, 50) + "...",
        messages: messages, // Only save the user's message initially
        agentId,
      });
      createConversationSpan.end({ output: { conversationId: newConversationId } });
      currentConversationId = newConversationId;
    } else {
      // Verify the conversation belongs to the user
      const findConversationSpan = trace.span({
        name: "find-conversation",
        input: { conversationId: currentConversationId },
      });
      const conversation = await db.query.conversationsTable.findFirst({
        where: eq(conversationsTable.id, currentConversationId),
      });
      if (!conversation || conversation.userId !== user.id) {
        return new Response("Conversation not found or unauthorized", { status: 404 });
      }
      findConversationSpan.end({ output: { conversation } });
    }
    trace.update({ sessionId: currentConversationId });



    return createDataStreamResponse({
      execute: async (dataStream) => {
        // If this is a new chat, send the chat ID to the frontend
        if (!conversationId) {
          dataStream.writeData({
            type: "NEW_CONVERSATION_CREATED",
            conversationId: currentConversationId,
          });
        }

        const result = streamText({
          experimental_telemetry: {
            isEnabled: true,
            functionId: `agent`,
            metadata: {
              langfuseTraceId: trace.id,
            },
          },
          model: google("gemini-2.0-flash"),
          messages,
          maxSteps: 10,
          system: SYSTEM_PROMPT_DEFAULT,
          tools: {
            getContext: {
              description: "Get the context from the db",
              parameters: z.object({
                question: z.string().describe("The question to get the context for, this is the last user message"),
              }),
              execute: async ({ question }) => {
                const getContextSpan = trace.span({
                  name: "get-context",
                  input: { question },
                });
                const context = await findRelevantContent(
                  question,
                  agentId
                );
                getContextSpan.end({ output: { context } });
                return context.map((c) => c.content).join(", ");
              },
            },
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
            const saveUpdatedConversationSpan = trace.span({
              name: "save-updated-conversation",
              input: {
                userId: user.id,
                conversationId: currentConversationId,
                title: lastMessage.content.slice(0, 50) + "...",
                messages: updatedMessages,
                agentId,
              },
            });
            await upsertConversation({
              userId: user.id,
              conversationId: currentConversationId,
              title: lastMessage.content.slice(0, 50) + "...",
              messages: updatedMessages,
              agentId,
            });
            saveUpdatedConversationSpan.end({ output: { conversationId: currentConversationId } });
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
  }
  catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
