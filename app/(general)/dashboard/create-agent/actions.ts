"use server";

import { createSafeActionClient } from "next-safe-action";
import { db } from "@/drizzle";
import {
  agentsTable,
  sourcesTable,
  type SelectSource,
  FileSourceDetails,
} from "@/drizzle/schema";
import { createClient } from "@/utils/supabase/server";
import { sourceStoreSchema } from "@/lib/validations/agent";
import { inngest } from "@/inngest/client";

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

export const createAgent = authActionClient
  .schema(sourceStoreSchema)
  .action(
    async ({
      ctx: { user },
      parsedInput: { file, notion, qa, text, websites },
    }) => {
      try {
        const result = await db.transaction(async (tx) => {
          // Create agent
          const [agent] = await tx
            .insert(agentsTable)
            .values({
              name:
                text?.name ||
                qa?.name ||
                `Agent ${new Date().toLocaleString()}`,
              userId: user.id,
              description: "Created from multiple sources",
              isPublic: false,
              config: {},
            })
            .returning();

          // Sources containers for the response
          let textSource: SelectSource | undefined;
          let fileSource: SelectSource[] = [];
          let websitesSource: SelectSource[] = [];
          let notionSource: SelectSource | undefined;
          let qaSource: SelectSource | undefined;

          // Insert text source
          if (text) {
            [textSource] = await tx
              .insert(sourcesTable)
              .values({
                agentId: agent.id,
                type: "text",
                name: text.name,
                details: {
                  content: text.content,
                }
              })
              .returning();
          }

          // Insert file sources
          if (file.length > 0) {
            fileSource = await tx
              .insert(sourcesTable)
              .values(
                file.map((f) => ({
                  agentId: agent.id,
                  type: "file" as const,
                  name: f.name,
                  details: {
                    fileUrl: f.fileUrl,
                    fileSize: f.fileSize,
                    mimeType: f.mimeType,
                  }
                }))
              )
              .returning();
          }

          // Insert website sources
          if (websites.length > 0) {
            websitesSource = await tx
              .insert(sourcesTable)
              .values(
                websites.map((w) => ({
                  agentId: agent.id,
                  type: "website" as const,
                  name: w.name,
                  details: {
                    url: w.url,
                    // TODO: website content add later
                    title: "add later",
                    content: "add later",
                  }
                }))
              )
              .returning();
          }

          // Insert QA source and pairs
          if (qa) {
            [qaSource] = await tx
              .insert(sourcesTable)
              .values({
                agentId: agent.id,
                type: "qa",
                name: qa.name,
                details: {
                  pairs: qa.qaPairs,
                }
              })
              .returning();
          }

          // Insert notion source
          if (notion) {
            [notionSource] = await tx
              .insert(sourcesTable)
              .values({
                agentId: agent.id,
                type: "notion",
                name: notion.name,
                details: {
                  pageId: notion.url,
                  title: notion.name,
                  // TODO: notion content add later
                  content: "add later",
                }
              })
              .returning();
          }

          // Trigger the Inngest pipeline for processing instead of doing it here
          let data = await inngest.send({
            name: "agent/pipeline.create",
            data: {
              agentId: agent.id,
              sources: {
                text: textSource
                  ? {
                    id: textSource.id,
                    name: textSource.name,
                    content: text!.content,
                  }
                  : null,
                files: fileSource.map((f) => ({
                  id: f.id,
                  name: f.name,
                  fileUrl: (f.details as FileSourceDetails).fileUrl,
                  fileSize: (f.details as FileSourceDetails).fileSize,
                  mimeType: (f.details as FileSourceDetails).mimeType,
                })),
                websites: websitesSource.map((w) => ({
                  id: w.id,
                  name: w.name,
                  url: "add later",
                  content: "add later",
                  title: "add later",
                })),
                qa: qaSource
                  ? {
                    id: qaSource.id,
                    name: qaSource.name,
                    pairs: qa!.qaPairs,
                  }
                  : null,
                notion: notionSource
                  ? {
                    id: notionSource.id,
                    name: notionSource.name,
                    pageId: "add later",
                    title: "add later",
                    content: "add later",
                  }
                  : null,
              },
            },
          });

          return {
            success: true,
            agent,
            runId: data.ids[0], // Return the Inngest run ID for tracking
          };
        });

        return result;
      } catch (error) {
        console.error("Error creating agent:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create agent",
        };
      }
    }
  );
