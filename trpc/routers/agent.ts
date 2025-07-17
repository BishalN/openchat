import { z } from "zod";
import { protectedProcedure, createTRPCRouter, baseProcedure } from "../init";
import {
  agentsTable,
  conversationsTable,
  sourcesTable,
  type AgentConfig,
} from "@/drizzle/schema";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });


export const agentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const agents = await ctx.db
      .select()
      .from(agentsTable)
      .where(and(eq(agentsTable.userId, ctx.user.id)))
      .orderBy(desc(agentsTable.createdAt));

    return agents;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agentsTable)
        .where(
          and(eq(agentsTable.id, input.id), eq(agentsTable.userId, ctx.user.id))
        );

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return agent;
    }),

  getPublicAgentById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select()
        .from(agentsTable)
        .where(
          and(eq(agentsTable.id, input.id), eq(agentsTable.isPublic, true))
        );

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return agent;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
        config: z
          .object({
            temperature: z.number().optional(),
            maxTokens: z.number().optional(),
            model: z.string().optional(),
            systemPrompt: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newAgent = await ctx.db
        .insert(agentsTable)
        .values({
          name: input.name,
          description: input.description || null,
          userId: ctx.user.id,
          isPublic: input.isPublic,
          config: (input.config || {}) as AgentConfig,
        })
        .returning();

      return newAgent[0];
    }),

  generalUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select({ id: agentsTable.id })
        .from(agentsTable)
        .where(
          and(eq(agentsTable.id, input.id), eq(agentsTable.userId, ctx.user.id))
        );

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found or you do not have permission to update it",
        });
      }
      // Update the agent
      const updatedAgent = await ctx.db
        .update(agentsTable)
        .set({
          name: input.name,
          isPublic: input.isPublic,
        })
        .where(eq(agentsTable.id, input.id))
        .returning();

      return updatedAgent[0];
    }),

  // // Update an existing agent
  // update: protectedProcedure
  //   .input(z.object({ id: z.number() }).merge(updateAgentSchema))
  //   .mutation(async ({ ctx, input }) => {
  //     const [agent] = await ctx.db
  //       .select({ id: agentsTable.id })
  //       .from(agentsTable)
  //       .where(
  //         and(eq(agentsTable.id, input.id), eq(agentsTable.userId, ctx.user.id))
  //       );

  //     if (!agent) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Agent not found or you do not have permission to update it",
  //       });
  //     }

  //     // Update the agent
  //     const updatedAgent = await ctx.db
  //       .update(agentsTable)
  //       .set({
  //         name: input.name,
  //         description: input.description || null,
  //         isPublic: input.isPublic,
  //         config: (input.config || {}) as AgentConfig,
  //       })
  //       .where(eq(agentsTable.id, input.id))
  //       .returning();

  //     return updatedAgent[0];
  //   }),

  // Delete an agent
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select({ id: agentsTable.id })
        .from(agentsTable)
        .where(
          and(eq(agentsTable.id, input.id), eq(agentsTable.userId, ctx.user.id))
        );

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found or you do not have permission to delete it",
        });
      }

      // Delete the agent
      await ctx.db.delete(agentsTable).where(eq(agentsTable.id, input.id));

      return { id: input.id };
    }),

  deleteAllConversations: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select({ id: agentsTable.id })
        .from(agentsTable)
        .where(
          and(eq(agentsTable.id, input.id), eq(agentsTable.userId, ctx.user.id))
        );

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found or you do not have permission to delete it",
        });
      }

      // delete all conversations
      await ctx.db
        .delete(conversationsTable)
        .where(eq(conversationsTable.agentId, input.id));

      return { id: input.id };
    }),

  // get all the sources given agent id
  getSources: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [agent] = await ctx.db
        .select({ id: agentsTable.id })
        .from(agentsTable)
        .where(
          and(eq(agentsTable.id, input.id), eq(agentsTable.userId, ctx.user.id))
        );

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found or you do not have permission to access it",
        });
      }

      // Get all sources for this agent
      const sources = await ctx.db
        .select({
          id: sourcesTable.id,
          type: sourcesTable.type,
          name: sourcesTable.name,
          details: sourcesTable.details,
          createdAt: sourcesTable.createdAt,
          updatedAt: sourcesTable.updatedAt,
        })
        .from(sourcesTable)
        .where(eq(sourcesTable.agentId, input.id));

      // For each source, if type is 'qa', extract pairs from details using a type guard
      const sourcesWithQA = sources.map((source) => {
        if (
          source.type === "qa" &&
          source.details &&
          typeof source.details === "object" &&
          "pairs" in source.details &&
          Array.isArray((source.details as any).pairs)
        ) {
          return {
            ...source,
            qaPairs: (source.details as any).pairs,
          };
        }
        return source;
      });

      return sourcesWithQA;
    }),


  // add website source
  // rather scrape the website and store the content in the db 

  addWebsiteSource: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { url } = input;

      // Scrape multiple websites (synchronous):
      const scrapedUrl = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });

      if (!scrapedUrl.success) {
        throw new Error(`Failed to scrape: ${scrapedUrl.error}`)
      }

      return scrapedUrl;
    }),

});
