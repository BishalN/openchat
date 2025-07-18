import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../init";
import { customActionsTable, agentsTable } from "@/drizzle/schema";
import { desc, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// TODO: keep all the schemas in a separate file for maximum reuse
// Zod schemas for validation
const dataInputSchema = z.object({
    name: z.string().min(1),
    type: z.enum(["Text", "Number", "Boolean", "Date"]),
    description: z.string(),
    array: z.boolean(),
});

const keyValuePairSchema = z.object({
    key: z.string(),
    value: z.string(),
});

const customActionConfigSchema = z.object({
    dataInputs: z.array(dataInputSchema),
    apiMethod: z.enum(["GET", "POST", "PUT", "DELETE"]),
    apiUrl: z.string().url(),
    parameters: z.array(keyValuePairSchema),
    headers: z.array(keyValuePairSchema),
    body: z.array(keyValuePairSchema),
    dataAccessType: z.enum(["full", "limited"]),
    allowedFields: z.array(z.string()).optional(),
    exampleResponse: z.string().optional(),
});

export const customActionsRouter = createTRPCRouter({
    // Get all custom actions for an agent
    getAll: protectedProcedure
        .input(z.object({ agentId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            // First verify the agent belongs to the user
            const [agent] = await ctx.db
                .select({ id: agentsTable.id })
                .from(agentsTable)
                .where(
                    and(eq(agentsTable.id, input.agentId), eq(agentsTable.userId, ctx.user.id))
                );

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found or you do not have permission to access it",
                });
            }

            // Get all custom actions for this agent
            const actions = await ctx.db
                .select()
                .from(customActionsTable)
                .where(
                    and(
                        eq(customActionsTable.agentId, input.agentId),
                    )
                )
                .orderBy(desc(customActionsTable.createdAt));

            return actions;
        }),

    // Get a single custom action by ID
    getById: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const [action] = await ctx.db
                .select()
                .from(customActionsTable)
                .where(eq(customActionsTable.id, input.id))
                .limit(1);

            if (!action) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Custom action not found",
                });
            }

            // Verify the agent belongs to the user
            const [agent] = await ctx.db
                .select({ id: agentsTable.id })
                .from(agentsTable)
                .where(
                    and(eq(agentsTable.id, action.agentId), eq(agentsTable.userId, ctx.user.id))
                );

            if (!agent) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have permission to access this custom action",
                });
            }

            return action;
        }),

    // Create a new custom action
    create: protectedProcedure
        .input(
            z.object({
                agentId: z.string().uuid(),
                name: z.string().min(1),
                whenToUse: z.string().min(1),
                config: customActionConfigSchema,
            })
        )
        .mutation(async ({ ctx, input }) => {
            // First verify the agent belongs to the user
            const [agent] = await ctx.db
                .select({ id: agentsTable.id })
                .from(agentsTable)
                .where(
                    and(eq(agentsTable.id, input.agentId), eq(agentsTable.userId, ctx.user.id))
                );

            if (!agent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found or you do not have permission to create actions for it",
                });
            }

            // Create the custom action
            const [newAction] = await ctx.db
                .insert(customActionsTable)
                .values({
                    agentId: input.agentId,
                    name: input.name,
                    whenToUse: input.whenToUse,
                    config: input.config,
                    isActive: true,
                })
                .returning();

            return newAction;
        }),

    // Update an existing custom action
    update: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string().min(1).optional(),
                whenToUse: z.string().min(1).optional(),
                config: customActionConfigSchema.optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get the existing action
            const [existingAction] = await ctx.db
                .select()
                .from(customActionsTable)
                .where(eq(customActionsTable.id, input.id))
                .limit(1);

            if (!existingAction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Custom action not found",
                });
            }

            // Verify the agent belongs to the user
            const [agent] = await ctx.db
                .select({ id: agentsTable.id })
                .from(agentsTable)
                .where(
                    and(eq(agentsTable.id, existingAction.agentId), eq(agentsTable.userId, ctx.user.id))
                );

            if (!agent) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have permission to update this custom action",
                });
            }

            // Update the custom action
            const [updatedAction] = await ctx.db
                .update(customActionsTable)
                .set({
                    name: input.name,
                    whenToUse: input.whenToUse,
                    config: input.config,
                    updatedAt: new Date(),
                })
                .where(eq(customActionsTable.id, input.id))
                .returning();

            return updatedAction;
        }),

    // Delete a custom action (soft delete)
    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            // Get the existing action
            const [existingAction] = await ctx.db
                .select()
                .from(customActionsTable)
                .where(eq(customActionsTable.id, input.id))
                .limit(1);

            if (!existingAction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Custom action not found",
                });
            }

            // Verify the agent belongs to the user
            const [agent] = await ctx.db
                .select({ id: agentsTable.id })
                .from(agentsTable)
                .where(
                    and(eq(agentsTable.id, existingAction.agentId), eq(agentsTable.userId, ctx.user.id))
                );

            if (!agent) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have permission to delete this custom action",
                });
            }

            // Soft delete by setting isActive to false
            await ctx.db
                .update(customActionsTable)
                .set({
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(eq(customActionsTable.id, input.id));

            return { id: input.id };
        }),

    // Test a custom action with provided data
    test: protectedProcedure
        .input(
            z.object({
                config: customActionConfigSchema,
                testData: z.record(z.string(), z.any()).optional(),
                useExampleResponse: z.boolean().default(false),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const { config, testData, useExampleResponse } = input;

                if (useExampleResponse && config.exampleResponse) {
                    // Return the example response
                    return {
                        success: true,
                        data: JSON.parse(config.exampleResponse),
                        source: "example",
                    };
                }

                // Build the URL with parameters
                let url = config.apiUrl;
                if (config.parameters.length > 0) {
                    const urlParams = new URLSearchParams();
                    config.parameters.forEach(({ key, value }) => {
                        // Replace placeholders with test data
                        let finalValue = value;
                        if (testData && value.includes("{{") && value.includes("}}")) {
                            const placeholder = value.match(/\{\{([^}]+)\}\}/)?.[1];
                            if (placeholder && testData[placeholder]) {
                                finalValue = testData[placeholder];
                            }
                        }
                        urlParams.append(key, finalValue);
                    });
                    url += `?${urlParams.toString()}`;
                }

                // Build headers
                const headers: Record<string, string> = {};
                config.headers.forEach(({ key, value }) => {
                    headers[key] = value;
                });

                // Build request body for POST/PUT requests
                let body: string | undefined;
                if ((config.apiMethod === "POST" || config.apiMethod === "PUT") && config.body.length > 0) {
                    const bodyData: Record<string, any> = {};
                    config.body.forEach(({ key, value }) => {
                        // Replace placeholders with test data
                        let finalValue = value;
                        if (testData && value.includes("{{") && value.includes("}}")) {
                            const placeholder = value.match(/\{\{([^}]+)\}\}/)?.[1];
                            if (placeholder && testData[placeholder]) {
                                finalValue = testData[placeholder];
                            }
                        }
                        bodyData[key] = finalValue;
                    });
                    body = JSON.stringify(bodyData);
                    headers["Content-Type"] = "application/json";
                }

                // Make the API call
                const response = await fetch(url, {
                    method: config.apiMethod,
                    headers,
                    body,
                });

                if (!response.ok) {
                    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                // Apply data access filtering if limited
                let filteredData = data;
                if (config.dataAccessType === "limited" && config.allowedFields) {
                    filteredData = filterDataByFields(data, config.allowedFields);
                }

                return {
                    success: true,
                    data: filteredData,
                    source: "api",
                    originalData: data,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error instanceof Error ? error.message : "Failed to test custom action",
                });
            }
        }),
});

// Helper function to filter data based on allowed fields
function filterDataByFields(data: any, allowedFields: string[]): any {
    if (typeof data !== "object" || data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => filterDataByFields(item, allowedFields));
    }

    const filtered: Record<string, any> = {};
    for (const field of allowedFields) {
        if (field.includes(".")) {
            // Handle nested fields like "user.name"
            const parts = field.split(".");
            let current = data;
            let valid = true;

            for (const part of parts.slice(0, -1)) {
                if (current && typeof current === "object" && part in current) {
                    current = current[part];
                } else {
                    valid = false;
                    break;
                }
            }

            if (valid && current && typeof current === "object" && parts[parts.length - 1] in current) {
                const lastPart = parts[parts.length - 1];
                filtered[field] = current[lastPart];
            }
        } else if (field in data) {
            filtered[field] = data[field];
        }
    }

    return filtered;
}
