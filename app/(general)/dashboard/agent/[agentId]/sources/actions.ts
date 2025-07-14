"use server";

import { createSafeActionClient } from "next-safe-action";
import { db } from "@/drizzle";
import {
  agentsTable,
  sourcesTable,
  qaPairsTable,
  embeddingsTable,
  type SelectSource,
} from "@/drizzle/schema";
import { createClient } from "@/utils/supabase/server";
import { inngest } from "@/inngest/client";
import { nanoid } from "nanoid";
import { and, eq, inArray } from "drizzle-orm";
import { sourceStoreSchema } from "@/lib/validations/agent";
import { z } from "zod";

const authActionClient = createSafeActionClient().use(async ({ next }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return next({ ctx: { user } });
});

export const retrainAgent = authActionClient
  .schema(
    sourceStoreSchema.extend({
      agentId: z.number().min(1, "Agent ID is required"),
    })
  )
  .action(
    async ({
      ctx: { user },
      parsedInput: { agentId, file: inputFiles, notion, qa, text, websites },
    }) => {
      try {
        const clientId = nanoid();

        const result = await db.transaction(async (tx) => {
          // 1. Verify agent ownership
          const [agent] = await tx
            .select({ id: agentsTable.id })
            .from(agentsTable)
            .where(
              and(eq(agentsTable.id, agentId), eq(agentsTable.userId, user.id))
            );

          if (!agent) {
            throw new Error("Agent not found or unauthorized");
          }

          // 2. Get existing sources, separating files from others
          const existingSources = await tx
            .select({
              id: sourcesTable.id,
              type: sourcesTable.type,
              fileUrl: sourcesTable.fileUrl,
            })
            .from(sourcesTable)
            .where(eq(sourcesTable.agentId, agentId));

          // IDs of sources to delete (non-file types)
          const nonFileSourceIdsToDelete = existingSources
            .filter((s) => s.type !== "file")
            .map((s) => s.id);

          // IDs of QA sources specifically (subset of nonFileSourceIdsToDelete)
          const existingQaSourceIds = existingSources
            .filter((s) => s.type === "qa")
            .map((s) => s.id);

          // URLs of existing files to avoid re-inserting
          const existingFileUrls = existingSources
            .filter((s) => s.type === "file" && s.fileUrl)
            .map((s) => s.fileUrl!);

          console.log("Existing file URLs:", existingFileUrls);
          console.log(
            "Non-file source IDs to delete:",
            nonFileSourceIdsToDelete
          );

          // 3. Delete embeddings (only for non-file sources), QA pairs, and non-file sources
          if (nonFileSourceIdsToDelete.length > 0) {
            // Delete embeddings only for non-file sources
            await tx
              .delete(embeddingsTable)
              .where(
                inArray(embeddingsTable.sourceId, nonFileSourceIdsToDelete)
              );
            console.log(
              `Deleted embeddings for ${nonFileSourceIdsToDelete.length} non-file sources.`
            );
          } else {
            console.log("No non-file source embeddings to delete.");
          }

          if (existingQaSourceIds.length > 0) {
            // Delete QA pairs (as before)
            await tx
              .delete(qaPairsTable)
              .where(inArray(qaPairsTable.sourceId, existingQaSourceIds));
            console.log(
              `Deleted QA pairs for ${existingQaSourceIds.length} QA sources.`
            );
          } else {
            console.log("No QA pairs to delete.");
          }

          if (nonFileSourceIdsToDelete.length > 0) {
            // Delete only non-file sources
            await tx
              .delete(sourcesTable)
              .where(inArray(sourcesTable.id, nonFileSourceIdsToDelete));
            console.log(
              `Deleted ${nonFileSourceIdsToDelete.length} non-file sources.`
            );
          } else {
            console.log("No non-file sources to delete.");
          }

          // 4. Insert or Upsert sources
          let textSource: SelectSource | undefined;
          let newFileSources: SelectSource[] = []; // Only newly inserted files
          let websitesSource: SelectSource[] = [];
          let notionSource: SelectSource | undefined;
          let qaSource: SelectSource | undefined;

          // Upsert text source (replace if exists, insert if not)
          if (text) {
            // Since we deleted non-file sources, this will always be an insert
            [textSource] = await tx
              .insert(sourcesTable)
              .values({
                agentId: agent.id,
                type: "text",
                name: text.name,
                content: text.content,
                characterCount: text.size,
              })
              .returning();
          }

          // Insert *new* file sources only
          if (inputFiles && inputFiles.length > 0) {
            const filesToInsert = inputFiles.filter(
              (f) => f.fileUrl && !existingFileUrls.includes(f.fileUrl) // Check URL exists and is not already present
            );

            console.log("New files to insert:", filesToInsert);

            if (filesToInsert.length > 0) {
              newFileSources = await tx
                .insert(sourcesTable)
                .values(
                  filesToInsert.map((f) => ({
                    agentId: agent.id,
                    type: "file" as const,
                    name: f.name,
                    fileUrl: f.fileUrl, // Already checked it exists
                    fileSize: f.fileSize,
                    mimeType: f.mimeType,
                  }))
                )
                .returning();
              console.log(
                `Inserted ${newFileSources.length} new file sources.`
              );
            } else {
              console.log("No new file sources to insert.");
            }
          }

          // Upsert website sources (replace/insert)
          if (websites && websites.length > 0) {
            // Since we deleted non-file sources, this will always be an insert
            websitesSource = await tx
              .insert(sourcesTable)
              .values(
                websites.map((w) => ({
                  agentId: agent.id,
                  type: "website" as const,
                  name: w.name,
                  url: w.url,
                }))
              )
              .returning();
          }

          // Upsert QA source and pairs (replace/insert)
          if (qa) {
            // Since we deleted non-file sources, this will always be an insert
            [qaSource] = await tx
              .insert(sourcesTable)
              .values({
                agentId: agent.id,
                type: "qa",
                name: qa.name,
                characterCount: qa.size,
              })
              .returning();

            // Insert QA pairs
            await tx.insert(qaPairsTable).values(
              qa.qaPairs.map((pair) => ({
                sourceId: qaSource!.id,
                question: pair.question,
                answer: pair.answer,
              }))
            );
          }

          // Upsert notion source (replace/insert)
          if (notion) {
            // Since we deleted non-file sources, this will always be an insert
            [notionSource] = await tx
              .insert(sourcesTable)
              .values({
                agentId: agent.id,
                type: "notion",
                name: notion.name,
                url: notion.url,
              })
              .returning();
          }

          // 5. Trigger the Inngest pipeline ONLY for newly added/updated sources
          // Note: We only send *newly inserted* files for processing. Existing files are assumed processed.
          const sourcesForPipeline = {
            text: textSource
              ? {
                  id: textSource.id,
                  name: textSource.name,
                  content: text!.content,
                  size: text!.size,
                }
              : null,
            files: newFileSources.map((f) => ({
              id: f.id,
              name: f.name,
              fileUrl: f.fileUrl!,
              mimeType: f.mimeType!,
              fileSize: f.fileSize ? f.fileSize : undefined,
            })),
            websites: websitesSource.map((w) => ({
              id: w.id,
              name: w.name,
              url: w.url!,
            })),
            qa: qaSource
              ? {
                  id: qaSource.id,
                  name: qaSource.name,
                  qaPairs: qa!.qaPairs,
                  size: qa!.size,
                }
              : null,
            notion: notionSource
              ? {
                  id: notionSource.id,
                  name: notionSource.name,
                  url: notionSource.url!,
                }
              : null,
          };

          // Check if there are any new/updated sources to process
          const hasNewData = Object.values(sourcesForPipeline).some(
            (val) => val !== null && (!Array.isArray(val) || val.length > 0)
          );

          let runId: string | undefined = undefined;
          if (hasNewData) {
            console.log(
              "Sending new/updated sources to Inngest pipeline:",
              sourcesForPipeline
            );
            const data = await inngest.send({
              name: "agent/pipeline.create",
              data: {
                agentId: agent.id,
                clientId,
                sources: sourcesForPipeline,
              },
            });
            runId = data.ids[0];
          } else {
            console.log("No new/updated sources to send to Inngest pipeline.");
          }

          return {
            success: true,
            clientId,
            runId: runId, // May be undefined if no new data was processed
          };
        });

        return result;
      } catch (error) {
        console.error("Error retraining agent:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to retrain agent",
        };
      }
    }
  );
