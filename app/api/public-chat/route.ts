import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { appendResponseMessages, createDataStreamResponse, Message, streamText, ToolSet } from "ai";
import { z } from "zod";
import { conversationsTable, messagesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { errorHandler } from "../chat/utils";
import { upsertConversation, upsertGuestConversation } from "@/drizzle/queries";
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config";
import { eq } from "drizzle-orm";
import { Langfuse } from "langfuse";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;


const langfuse = new Langfuse({
  environment: process.env.NODE_ENV ?? "development",
});


export async function POST(req: Request) {
  try {
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
      await upsertGuestConversation({
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
      if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
      }
    }

    const trace = langfuse.trace({
      sessionId: currentConversationId,
      name: "chat",
    });

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
            functionId: `public-chat`,
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
            await upsertGuestConversation({
              conversationId: currentConversationId,
              title: lastMessage.content.slice(0, 50) + "...",
              messages: updatedMessages,
              agentId,
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
    console.error("Error processing chat request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorHandler(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
