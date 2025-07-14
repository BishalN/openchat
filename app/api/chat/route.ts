import { findRelevantContent } from "@/lib/ai/embedding";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";
import {
  profilesTable,
} from "@/drizzle/schema";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";

import { eq } from "drizzle-orm";
import {
  handleConversation,
  storeMessage,
  selectModel,
  errorHandler,
} from "./utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define supported models with Zod
const SupportedModel = z.enum([
  // GPT models
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4.5",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "o3-mini",
  // Claude models
  "claude-3-7-sonnet",
  "claude-3-5-sonnet",
  "claude-3-opus",
  "claude-3-haiku",
  // Gemini models
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
  // Command models
  "command-r",
  "command-r-plus",
  // DeepSeek models
  "DeepSeek-V3",
  "DeepSeek-R1",
  // Llama models
  "Llama-4-Scout-17B-16E-Instruct",
  "Llama-4-Maverick-17B-128E-Instruct-FP8",
  // Grok models
  "grok-3",
  "grok-3-mini",
]);

// Define message schema
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

// TODO: No need for this, get from db directly, remove this
// Define the request body schema
const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  agentId: z
    .string()
    .or(z.number())
    .transform((val) => String(val)),
  stream: z.boolean().default(false).optional(),
  temperature: z.number().min(0).max(1).default(0).optional(),
  conversationId: z.string().optional(),
  model: SupportedModel.optional(),
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

    const userId = user.id;

    // Fetch user profile to check credits
    const [profile] = await db
      .select({ id: profilesTable.id })
      .from(profilesTable)
      .where(eq(profilesTable.id, userId))
      .limit(1);

    if (!profile) {
      // This case should ideally not happen if user exists in auth
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }


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

    const {
      messages,
      agentId,
      stream = false,
      temperature = 0,
      conversationId,
      model,
    } = parsedBody.data;

    // Get the last message from the user (should be the most recent message)
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();

    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find relevant context based on the agent ID and user's message
    const context = await findRelevantContent(
      lastUserMessage.content,
      Number(agentId)
    );

    // Set up system prompt with context information
    const systemPrompt = `You are a helpful assistant. Answer the following question based only on the provided context: ${context.map((c) => c.name).join(", ")}
    Question: ${lastUserMessage.content}
    
    Don't include any disclaimers or unnecessary information. Just answer the question based on the context provided. If you don't know the answer, say "I don't know."

    Be direct avoid saying based on the context or anything similar.
    `;

    // Create or update conversation
    const conversationIdToUse = await handleConversation(
      agentId,
      userId,
      lastUserMessage,
      conversationId
    );

    // Store the user message
    await storeMessage(
      conversationIdToUse,
      lastUserMessage.role,
      lastUserMessage.content
    );

    // Generate response
    const result = streamText({
      model: model ? selectModel(model) : google("gemini-2.0-flash"),
      // TODO: Provide users option to use local models;
      // model: lmGemmaModel,
      messages,
      system: systemPrompt,
      temperature,
    });

    // Clone the response to store it and stream it simultaneously
    const response = result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });

    // Return the original streaming response to the client
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
