import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import {
    agentChatInterfaceConfigsTable,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { chatInterfaceSchema } from "@/lib/validations/chat-interface";

export const chatInterfaceRouter = createTRPCRouter({
    getByAgentId: protectedProcedure
        .input(z.object({ agentId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const [config] = await ctx.db
                .select()
                .from(agentChatInterfaceConfigsTable)
                .where(eq(agentChatInterfaceConfigsTable.agentId, input.agentId));
            if (!config) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Config not found" });
            }
            return config;
        }),

    create: protectedProcedure
        .input(
            z.object({
                agentId: z.string().uuid(),
                config: chatInterfaceSchema,
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if config already exists
            const [existing] = await ctx.db
                .select()
                .from(agentChatInterfaceConfigsTable)
                .where(eq(agentChatInterfaceConfigsTable.agentId, input.agentId));
            if (existing) {
                throw new TRPCError({ code: "CONFLICT", message: "Config already exists for this agent" });
            }
            const [created] = await ctx.db
                .insert(agentChatInterfaceConfigsTable)
                .values({ agentId: input.agentId, config: input.config })
                .returning();
            return created;
        }),

    update: protectedProcedure
        .input(
            z.object({
                agentId: z.string().uuid(),
                config: chatInterfaceSchema,
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [updated] = await ctx.db
                .update(agentChatInterfaceConfigsTable)
                .set({ config: input.config, updatedAt: new Date() })
                .where(eq(agentChatInterfaceConfigsTable.agentId, input.agentId))
                .returning();
            if (!updated) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Config not found for update" });
            }
            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ agentId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const [deleted] = await ctx.db
                .delete(agentChatInterfaceConfigsTable)
                .where(eq(agentChatInterfaceConfigsTable.agentId, input.agentId))
                .returning();
            if (!deleted) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Config not found for delete" });
            }
            return { success: true };
        }),
});
