//@ts-nocheck

// TODO: Fix this process of parsing and creating embeddings

import { inngest } from "./client";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from "@supabase/supabase-js";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { db } from "@/drizzle";
import { embeddingsTable } from "@/drizzle/schema";
import { generateEmbeddings } from "@/lib/ai/embedding";

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
 * Helper functions to avoid nesting step.* tooling
 */

// Process PDF files
async function processPdfFile(
  file,
  textSplitter: RecursiveCharacterTextSplitter
) {
  try {
    // Get file path from URL
    const filepath = file.fileUrl.split("files/")[1];

    // Get signed URL with admin privileges
    const { data: signedUrl, error } = await supabaseAdmin.storage
      .from("files")
      .createSignedUrl(filepath, 60); // 60 seconds expiry

    if (error || !signedUrl) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    // Download and process the PDF
    const response = await fetch(signedUrl.signedUrl);
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();
    const textChunks = await textSplitter.splitDocuments(docs);

    return textChunks.map((chunk) => ({
      sourceId: file.id,
      content: chunk.pageContent,
      metadata: {
        ...chunk.metadata,
        type: "file",
        name: file.name,
        mimeType: file.mimeType,
      },
    }));
  } catch (error) {
    console.error(`Error processing PDF ${file.name}:`, error);
    return [];
  }
}

// Process text content
async function processTextContent(textSource, textSplitter) {
  try {
    const textChunks = await textSplitter.splitText(textSource.content);

    return textChunks.map((chunk) => ({
      sourceId: textSource.id,
      content: chunk,
      metadata: {
        type: "text",
        name: textSource.name,
      },
    }));
  } catch (error) {
    console.error("Error processing text:", error);
    return [];
  }
}

// Process QA pairs
function processQAPairs(qaSource) {
  return qaSource.qaPairs.map((pair) => ({
    sourceId: qaSource.id,
    content: `Question: ${pair.question}\nAnswer: ${pair.answer}`,
    metadata: {
      type: "qa",
      name: qaSource.name,
    },
  }));
}

// Generate embeddings for a batch
async function generateEmbeddingsForBatch(batch) {
  try {
    return await Promise.all(
      batch.map(async (chunk) => {
        const results = await generateEmbeddings(chunk.content);
        const embeddingResult = results[0];
        return {
          sourceId: chunk.sourceId,
          content: chunk.content,
          embedding: embeddingResult.embedding,
          metadata: JSON.stringify(chunk.metadata),
        };
      })
    );
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return [];
  }
}

/**
 * This function handles the entire agent creation pipeline:
 * 1. Process sources (chunking content)
 * 2. Generate embeddings
 * 3. Store in database
 * 4. Report progress to frontend
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
      // Important: Don't nest step tooling - use separate functions instead
      const chunks = await step.run("Process sources", async () => {
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });

        const allChunks = [];

        // Process files (PDFs)
        if (sources.files && sources.files.length > 0) {
          for (let i = 0; i < sources.files.length; i++) {
            const file = sources.files[i];
            if (file.mimeType === "application/pdf") {
              const fileChunks = await processPdfFile(file, textSplitter);
              allChunks.push(...fileChunks);
            }
          }
        }

        // Process text content
        if (sources.text) {
          const textChunks = await processTextContent(
            sources.text,
            textSplitter
          );
          allChunks.push(...textChunks);
        }

        // Process QA pairs
        if (sources.qa) {
          const qaChunks = processQAPairs(sources.qa);
          allChunks.push(...qaChunks);
        }

        return allChunks;
      });

      // 2. Generate embeddings - Separate from chunking to avoid nesting
      const embeddingsWithContent = await step.run(
        "Generate embeddings",
        async () => {
          // Process chunks in batches to avoid overwhelming embedding API
          const batchSize = 20;
          const batches = [];

          for (let i = 0; i < chunks.length; i += batchSize) {
            batches.push(chunks.slice(i, i + batchSize));
          }

          let allEmbeddings = [];

          // TODO: fix this
          // Process each batch separately
          for (let i = 0; i < batches.length; i++) {
            const batchResults = await generateEmbeddingsForBatch(batches[i]);
            allEmbeddings = [...allEmbeddings, ...batchResults];
          }

          return allEmbeddings;
        }
      );

      // 3. Store embeddings in database
      await step.run("Store in database", async () => {
        // Insert in batches to avoid overwhelming the database
        const storeBatchSize = 100;
        const storeBatches = [];

        for (let i = 0; i < embeddingsWithContent.length; i += storeBatchSize) {
          storeBatches.push(embeddingsWithContent.slice(i, i + storeBatchSize));
        }

        for (let i = 0; i < storeBatches.length; i++) {
          await db.insert(embeddingsTable).values(storeBatches[i]);
        }
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
