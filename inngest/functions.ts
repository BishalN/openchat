import { inngest } from "./client";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/drizzle";
import { embeddingsTable } from "@/drizzle/schema";
import { embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { SourceProcessor } from "./source-processor";

// Create Supabase admin client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * This function handles the entire agent creation pipeline:
 * 1. Process sources (chunking content)
 * 2. Generate embeddings
 * 3. Store in database
 */
export const createAgentPipeline = inngest.createFunction(
  {
    id: "agent/pipeline.create",
    retries: 3,
  },
  { event: "agent/pipeline.create" },
  async ({ event, step }) => {
    const { agentId, sources } = event.data;

    try {
      // 1. Process each source type (chunking)
      const chunks = await step.run("Process sources", async () => {
        // TODO: maybe use a intelligent chunk size instead of static one here
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const processor = new SourceProcessor(textSplitter, supabaseAdmin);

        return await processor.chunkSource(sources);
      });

      // 2. Generate embeddings using embedMany from Vercel AI SDK
      const embeddingsWithContent = await step.run(
        "Generate embeddings",
        async () => {
          const embeddingModel = google.textEmbeddingModel("text-embedding-004");
          // Prepare the content array for embedding
          const values = chunks.map((chunk) => chunk.content);
          // Call embedMany once for all chunks
          const { embeddings } = await embedMany({
            model: embeddingModel,
            values,
          });
          // Map embeddings back to chunk metadata
          return embeddings.map((embedding, i) => ({
            sourceId: chunks[i].sourceId,
            content: chunks[i].content,
            embedding,
            metadata: JSON.stringify(chunks[i].metadata),
          }));
        }
      );

      // 3. Store embeddings in database
      await step.run("Store in database", async () => {
        await db.insert(embeddingsTable).values(embeddingsWithContent.map((embedding) => ({
          content: embedding.content,
          sourceId: embedding.sourceId,
          embedding: embedding.embedding,
          metadata: JSON.parse(embedding.metadata),
        })));
      });

      return {
        agentId,
        chunksProcessed: chunks.length,
        embeddingsStored: embeddingsWithContent.length,
      };
    } catch (error) {
      console.error("Error in agent creation pipeline:", error);
      throw error;
    }
  }
);
