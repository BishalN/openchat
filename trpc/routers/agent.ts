import { z } from "zod";
import { protectedProcedure, createTRPCRouter, baseProcedure } from "../init";
import {
  agentsTable,
  conversationsTable,
  sourcesTable,
  qaPairsTable,
  type AgentConfig,
} from "@/drizzle/schema";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createUpdateSchema, createSelectSchema } from "drizzle-zod";

const updateAgentSchema = createUpdateSchema(agentsTable);
const baseSelectSchema = createSelectSchema(agentsTable);

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
    .input(z.object({ id: z.number() }))
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
    .input(z.object({ id: z.number() }))
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
      updateAgentSchema
        .pick({ id: true, name: true, creditLimit: true, isPublic: true })
        .extend({ id: z.number({ required_error: "Id is required" }) })
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
          creditLimit: input.creditLimit,
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
    .input(baseSelectSchema.pick({ id: true }))
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
    .input(z.object({ id: z.number() }))
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
    .input(z.object({ id: z.number() }))
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
          content: sourcesTable.content,
          url: sourcesTable.url,
          fileUrl: sourcesTable.fileUrl,
          fileSize: sourcesTable.fileSize,
          mimeType: sourcesTable.mimeType,
          characterCount: sourcesTable.characterCount,
          createdAt: sourcesTable.createdAt,
          updatedAt: sourcesTable.updatedAt,
        })
        .from(sourcesTable)
        .where(eq(sourcesTable.agentId, input.id));

      // TODO: Fix this For each source, fetch its QA pairs if the source type is 'qa'
      const sourcesWithQA = await Promise.all(
        sources.map(async (source) => {
          if (source.type === "qa") {
            const qaPairs = await ctx.db
              .select({
                id: qaPairsTable.id,
                question: qaPairsTable.question,
                answer: qaPairsTable.answer,
                createdAt: qaPairsTable.createdAt,
                updatedAt: qaPairsTable.updatedAt,
              })
              .from(qaPairsTable)
              .where(eq(qaPairsTable.sourceId, source.id));

            return {
              ...source,
              qaPairs,
            };
          }
          return source;
        })
      );

      return sourcesWithQA;
    }),
});
