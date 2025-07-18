import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { customActionsTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/drizzle";

export async function GET(
    request: NextRequest,
    { params }: { params: { actionId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { actionId } = params;

        // Get the custom action and verify ownership
        const [action] = await db
            .select()
            .from(customActionsTable)
            .where(eq(customActionsTable.id, actionId))
            .limit(1);

        if (!action) {
            return NextResponse.json({ error: "Action not found" }, { status: 404 });
        }

        // Verify the agent belongs to the user
        const { data: agent } = await supabase
            .from("agents")
            .select("id")
            .eq("id", action.agentId)
            .eq("user_id", user.id)
            .single();

        if (!agent) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        return NextResponse.json({ action });
    } catch (error) {
        console.error("Error fetching custom action:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { actionId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { actionId } = params;
        const body = await request.json();
        const {
            name,
            description,
            whenToUse,
            config
        } = body;

        // Validate required fields
        if (!name || !whenToUse || !config) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get the existing action and verify ownership
        const [existingAction] = await db
            .select()
            .from(customActionsTable)
            .where(eq(customActionsTable.id, actionId))
            .limit(1);

        if (!existingAction) {
            return NextResponse.json({ error: "Action not found" }, { status: 404 });
        }

        // Verify the agent belongs to the user
        const { data: agent } = await supabase
            .from("agents")
            .select("id")
            .eq("id", existingAction.agentId)
            .eq("user_id", user.id)
            .single();

        if (!agent) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Update the custom action
        const [updatedAction] = await db
            .update(customActionsTable)
            .set({
                name,
                description,
                whenToUse,
                config,
                updatedAt: new Date(),
            })
            .where(eq(customActionsTable.id, actionId))
            .returning();

        return NextResponse.json({ action: updatedAction });
    } catch (error) {
        console.error("Error updating custom action:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { actionId: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { actionId } = params;

        // Get the existing action and verify ownership
        const [existingAction] = await db
            .select()
            .from(customActionsTable)
            .where(eq(customActionsTable.id, actionId))
            .limit(1);

        if (!existingAction) {
            return NextResponse.json({ error: "Action not found" }, { status: 404 });
        }

        // Verify the agent belongs to the user
        const { data: agent } = await supabase
            .from("agents")
            .select("id")
            .eq("id", existingAction.agentId)
            .eq("user_id", user.id)
            .single();

        if (!agent) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Soft delete by setting isActive to false
        await db
            .update(customActionsTable)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(customActionsTable.id, actionId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting custom action:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}