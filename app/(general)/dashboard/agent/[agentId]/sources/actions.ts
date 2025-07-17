"use server";

import { createSafeActionClient } from "next-safe-action";
import { db } from "@/drizzle";
import {
  agentsTable,
  sourcesTable,
  embeddingsTable,
  type SelectSource,
  FileSourceDetails,
  WebsiteSourceDetails,
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
      agentId: z.string(),
    })
  )
  .action(
    async ({
      ctx: { user },
      parsedInput: { agentId, file: inputFiles, qa, text, websites },
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
              details: sourcesTable.details,
            })
            .from(sourcesTable)
            .where(eq(sourcesTable.agentId, agentId));

          // IDs of sources to delete (non-file types)
          const nonFileAndWebsiteSourceIdsToDelete = existingSources
            .filter((s) => s.type !== "file" && s.type !== "website")
            .map((s) => s.id);

          // IDs of QA sources specifically (subset of nonFileAndWebsiteSourceIdsToDelete)
          const existingQaSourceIds = existingSources
            .filter((s) => s.type === "qa")
            .map((s) => s.id);

          // URLs of existing files to avoid re-inserting
          const existingFileUrls = existingSources
            .filter((s) => s.type === "file" && (s.details as FileSourceDetails).fileUrl)
            .map((s) => (s.details as FileSourceDetails).fileUrl!);

          // URLs of existing websites to avoid re-inserting
          const existingWebsiteUrls = existingSources
            .filter((s) => s.type === "website" && (s.details as WebsiteSourceDetails).url)
            .map((s) => (s.details as WebsiteSourceDetails).url!);

          // 3. Delete embeddings (only for non-file sources), QA pairs, and non-file sources
          if (nonFileAndWebsiteSourceIdsToDelete.length > 0) {
            // Delete embeddings only for non-file sources
            await tx
              .delete(embeddingsTable)
              .where(
                inArray(embeddingsTable.sourceId, nonFileAndWebsiteSourceIdsToDelete)
              );
          }

          if (existingQaSourceIds.length > 0) {
            // Delete QA pairs (as before)
            await tx
              .delete(sourcesTable)
              .where(inArray(sourcesTable.id, existingQaSourceIds));
          }

          if (nonFileAndWebsiteSourceIdsToDelete.length > 0) {
            // Delete only non-file sources
            await tx
              .delete(sourcesTable)
              .where(inArray(sourcesTable.id, nonFileAndWebsiteSourceIdsToDelete));
          }

          // 4. Insert or Upsert sources
          let textSource: SelectSource | undefined;
          let newFileSources: SelectSource[] = []; // Only newly inserted files
          let websitesSource: SelectSource[] = [];
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
                details: {
                  content: text.content,
                  characterCount: text.size,
                },
              })
              .returning();
          }

          // Insert *new* file sources only
          if (inputFiles && inputFiles.length > 0) {
            const filesToInsert = inputFiles.filter(
              (f) => f.fileUrl && !existingFileUrls.includes(f.fileUrl) // Check URL exists and is not already present
            );

            if (filesToInsert.length > 0) {
              newFileSources = await tx
                .insert(sourcesTable)
                .values(
                  filesToInsert.map((f) => ({
                    agentId: agent.id,
                    type: "file" as const,
                    name: f.name,
                    details: {
                      fileUrl: f.fileUrl!, // Already checked it exists
                      fileSize: f.fileSize,
                      mimeType: f.mimeType,
                    },
                  }))
                )
                .returning();
            }
          }

          // Insert new website sources
          if (websites && websites.length > 0) {
            const websitesToInsert = websites.filter((w) => w.content && w.content.length > 0 && !existingWebsiteUrls.includes(w.url!));

            if (websitesToInsert.length > 0) {
              websitesSource = await tx
                .insert(sourcesTable)
                .values(
                  websitesToInsert.map((w) => ({
                    agentId: agent.id,
                    type: "website" as const,
                    name: w.name,
                    details: {
                      content: w.content!,
                      url: w.url!,
                    },
                  }))
                )
                .returning();
            }

            // Upsert QA source and pairs (replace/insert)
            if (qa) {
              // Since we deleted non-file sources, this will always be an insert
              [qaSource] = await tx
                .insert(sourcesTable)
                // @ts-ignore
                .values({
                  agentId: agent.id,
                  type: "qa",
                  name: qa.name,
                  details: {
                    qaPairs: qa.qaPairs,
                    characterCount: qa.size,
                  },
                })
                .returning();

            }

            // if the website has content then its a new website source otherwise its not
            // or TODO:check to see if the website exists in db, if it exists than its not a new website source
            // const newWebsiteSources = websites.filter((w) => w.content && w.content.length > 0);
            console.log(JSON.stringify(websitesSource, null, 2));



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
                fileUrl: (f.details as FileSourceDetails).fileUrl!,
                mimeType: (f.details as FileSourceDetails).mimeType!,
                fileSize: (f.details as FileSourceDetails).fileSize ? (f.details as FileSourceDetails).fileSize : undefined,
              })),
              websites: websitesSource.map((w) => ({
                name: w.name,
                content: (w.details as WebsiteSourceDetails).content!,
                url: w.name,
                id: w.id,
              })),
              qa: qaSource
                ? {
                  id: qaSource.id,
                  name: qaSource.name,
                  pairs: qa!.qaPairs,
                  size: qa!.size,
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
          }
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
