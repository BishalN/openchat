import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { appendResponseMessages, createDataStreamResponse, Message, streamText, ToolSet } from "ai";
import { z } from "zod";
import {
  conversationsTable,
  messagesTable,
} from "@/drizzle/schema";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";

import { errorHandler } from "./utils";
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config";
import { upsertConversation } from "@/drizzle/queries";
import { eq } from "drizzle-orm";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;



// TODO: No need for this, get from db directly, remove this
// Define the request body schema
// const ChatRequestSchema = z.object({
//   messages: z.array(MessageSchema),
//   agentId: z
//     .string()
//     .or(z.number())
//     .transform((val) => String(val)),
//   conversationId: z.string().default("d9cd7725-e8e3-4c06-9ea8-1883a4c8d9fb"),
// });

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

    // Parse and validate request body
    const body = await req.json() as {
      messages: Array<Message>;
      conversationId?: string;
      agentId: string;
    };

    const { messages, agentId, conversationId } = body;
    if (!messages.length) {
      return new Response("No messages provided", { status: 400 });
    }
    // If no conversationId is provided, create a new conversation with the user's message
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversationId = crypto.randomUUID();
      await upsertConversation({
        userId: user.id,
        conversationId: newConversationId,
        title: messages[messages.length - 1]!.content.slice(0, 50) + "...",
        messages: messages, // Only save the user's message initially
        agentId,
      });
      currentConversationId = newConversationId;
    } else {
      // Verify the conversation belongs to the user
      const conversation = await db.query.conversationsTable.findFirst({
        where: eq(conversationsTable.id, currentConversationId),
      });
      if (!conversation || conversation.userId !== user.id) {
        return new Response("Conversation not found or unauthorized", { status: 404 });
      }
    }

    //  // TODO: use tool call to get the context from db instead of system prompt
    // // Set up system prompt with context information
    // const systemPrompt = `${SYSTEM_PROMPT_DEFAULT} 

    // Last user message: ${lastUserMessage.content}

    // Use the tools to get the context from the db and answer questions.

    // Don't include any disclaimers or unnecessary information. Just answer the question based on the context provided. If you don't know the answer, say "I don't know."

    // Be direct avoid saying based on the context or anything similar.
    // `;


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
                const context = await findRelevantContent(
                  question,
                  agentId
                );
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
            await upsertConversation({
              userId: user.id,
              conversationId: currentConversationId,
              title: lastMessage.content.slice(0, 50) + "...",
              messages: updatedMessages,
              agentId,
            });
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
