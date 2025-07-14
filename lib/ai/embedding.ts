import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { embeddingsTable, sourcesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";

const embeddingModel = google.textEmbeddingModel("text-embedding-004");


export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (
  userQuery: string,
  agentId: string
) => {
  // Generate embedding for the user query
  const userQueryEmbedded = await generateEmbedding(userQuery);

  // Calculate cosine similarity (1 - cosine distance)
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddingsTable.embedding,
    userQueryEmbedded
  )})`;

  // Query for relevant content from this specific agent only
  const similarContent = await db
    .select({
      content: embeddingsTable.content,
      confidence: similarity,
      metadata: embeddingsTable.metadata,
      chunkIndex: embeddingsTable.chunkIndex,
      sourceId: embeddingsTable.sourceId,
      sourceType: sourcesTable.type,
      sourceName: sourcesTable.name,
      sourceDetails: sourcesTable.details,
    })
    .from(embeddingsTable)
    .innerJoin(sourcesTable, eq(embeddingsTable.sourceId, sourcesTable.id))
    .where(and(eq(sourcesTable.agentId, agentId), gt(similarity, 0.5)))
    .orderBy(desc(similarity))
    .limit(5); // Increased limit for better context

  return similarContent;
};
