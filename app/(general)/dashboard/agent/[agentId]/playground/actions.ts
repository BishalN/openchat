"use server";

import { createSafeActionClient } from "next-safe-action";
import { db } from "@/drizzle";
import { agentsTable, type AgentConfig } from "@/drizzle/schema";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { agentConfigActionSchema } from "@/lib/schemas/agent-config";

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

// Server action to update agent configuration
export const updateAgentConfig = authActionClient
  .schema(agentConfigActionSchema)
  .action(async ({ ctx: { user }, parsedInput: { agentId, config } }) => {
    try {
      // First verify the agent belongs to the user
      //   const agent = await db.query.agentsTable.findFirst({
      //     where: (agents, { eq, and }) =>
      //       and(eq(agents.id, agentId), eq(agents.userId, user.id)),
      //   });

      const [agent] = await db
        .select()
        .from(agentsTable)
        .where(eq(agentsTable.id, agentId))
        .execute();

      if (!agent) {
        return {
          success: false,
          error: "Agent not found or you don't have permission to modify it",
        };
      }

      // Update agent configuration
      await db
        .update(agentsTable)
        .set({
          config: config as AgentConfig,
          updatedAt: new Date(),
        })
        .where(eq(agentsTable.id, agentId))
        .execute();

      return {
        success: true,
        data: { agentId, config },
      };
    } catch (error) {
      console.error("Error updating agent config:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update agent configuration",
      };
    }
  });
