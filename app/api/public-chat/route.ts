import { db } from "@/drizzle";
import { agentsTable } from "@/drizzle/schema";
import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  selectModel,
  errorHandler,
} from "../chat/utils";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

// Update the request schema to only require agentId
const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  //   conversationId: z.string(),
  agentId: z
    .string()
    .or(z.number())
    .transform((val) => String(val)),
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

    const { messages, agentId } = parsedBody.data;

    // Fetch agent configuration
    const [agent] = await db
      .select({
        id: agentsTable.id,
        userId: agentsTable.userId,
        config: agentsTable.config,
      })
      .from(agentsTable)
      .where(eq(agentsTable.id, parseInt(agentId)))
      .limit(1);

    if (!agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract configuration from agent
    const {
      temperature = 0,
      model = "gemini-2.5-pro-exp-03-25",
      systemPrompt: customSystemPrompt,
    } = agent.config as {
      temperature?: number;
      model?: string;
      systemPrompt?: string;
    };

    // Get the last message from the user
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();

    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find relevant context
    const context = await findRelevantContent(
      lastUserMessage.content,
      Number(agentId)
    );

    // Combine custom system prompt with context
    const systemPrompt = `${customSystemPrompt || "You are a helpful assistant."} 
    Answer the following question based only on the provided context: ${context.map((c) => c.name).join(", ")}
    
    Question: ${lastUserMessage.content}
    
    Don't include any disclaimers or unnecessary information. Just answer the question based on the context provided. If you don't know the answer, say "I don't know."

    Be direct avoid saying based on the context or anything similar.
    `;

    // Generate response using agent's configuration
    const result = streamText({
      model: model ? selectModel(model) : google("gemini-2.5-pro-exp-03-25"),
      messages,
      system: systemPrompt,
      temperature,
    });

    // Clone and return response
    const response = result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });

    return response;
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
