import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { embeddingsTable, sourcesTable } from "@/drizzle/schema";
import { db } from "@/drizzle";
import { lmstudio } from "@/app/api/chat/utils";

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

// const lmEmbeddingModel = lmstudio.textEmbeddingModel('text-embedding-mxbai-embed-large-v1',{
//   dimensions: 768,
// });

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    // model: lmEmbeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

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
  agentId: number
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
      name: embeddingsTable.content,
      similarity,
    })
    .from(embeddingsTable)
    .innerJoin(sourcesTable, eq(embeddingsTable.sourceId, sourcesTable.id))
    .where(and(eq(sourcesTable.agentId, agentId), gt(similarity, 0.5)))
    .orderBy(desc(similarity))
    .limit(5); // Increased limit for better context

  return similarContent;
};
