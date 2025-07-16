import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { streamText, ToolSet } from "ai";
import { z } from "zod";
import { messagesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { errorHandler } from "../chat/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  agentId: z
    .string()
    .or(z.number())
    .transform((val) => String(val)),
  conversationId: z.string().default("d9cd7725-e8e3-4c06-9ea8-1883a4c8d9fb"),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const parsedBody = ChatRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: parsedBody.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, agentId, conversationId } = parsedBody.data;

    // Get the last message from the user (should be the most recent message)
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    // insert the user message to the db
    await db.insert(messagesTable).values({
      conversationId: conversationId,
      role: "user",
      content: lastUserMessage.content as string,
      createdAt: new Date(),
    });

    // Find relevant context based on the agent ID and user's message
    const context = await findRelevantContent(
      lastUserMessage.content,
      agentId
    );

    // Set up system prompt with context information
    const systemPrompt = `You are a helpful assistant.\n\nLast user message: ${lastUserMessage.content}\n\nUse the tools to get the context from the db and answer questions.\n\nDon't include any disclaimers or unnecessary information. Just answer the question based on the context provided. If you don't know the answer, say "I don't know."\n\nBe direct avoid saying based on the context or anything similar.`;

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: messages,
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
      } as ToolSet,
      maxSteps: 10,
      onError: (err: unknown) => {
        console.error("Streaming error occurred:", err)
      },
      onFinish: async ({ response }) => {
        await db.insert(messagesTable).values({
          conversationId: conversationId,
          role: response.messages[0].role as "user" | "assistant" | "system",
          content: response.messages[0].content as string,
          createdAt: new Date(),
        });
      },
    })

    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
      getErrorMessage: (error: unknown) => {
        console.error("Error forwarded to client:", error)
        return errorHandler(error)
      },
    })
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
