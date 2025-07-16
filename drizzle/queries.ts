import { db } from ".";
import { conversationsTable, messagesTable } from "./schema";
import type { Message } from "ai";
import { eq, and } from "drizzle-orm";

export const upsertConversation = async (opts: {
    userId: string;
    conversationId: string;
    title: string;
    messages: Message[];
    agentId: string;
}) => {
    const { userId, conversationId, title, messages: newMessages, agentId } = opts;

    // First, check if the conversation exists and belongs to the user
    const existingConversation = await db.query.conversationsTable.findFirst({
        where: eq(conversationsTable.id, conversationId),
    });

    if (existingConversation) {
        // If conversation exists but belongs to a different user, throw error
        if (existingConversation.userId !== userId) {
            throw new Error("Conversation ID already exists under a different user");
        }
        // Delete all existing messages
        await db.delete(messagesTable).where(eq(messagesTable.conversationId, conversationId));
    } else {
        // Create new conversation
        await db.insert(conversationsTable).values({
            id: conversationId,
            userId,
            title,
            agentId,
        });
    }

    // Insert all messages
    await db.insert(messagesTable).values(
        newMessages.map((message, index) => ({
            id: crypto.randomUUID(),
            conversationId,
            role: message.role,
            parts: message.parts,
            order: index,
        })),
    );

    return { id: conversationId };
};

export const getConversation = async (opts: { userId: string; conversationId: string }) => {
    const { userId, conversationId } = opts;

    const chat = await db.query.conversationsTable.findFirst({
        where: and(eq(conversationsTable.id, conversationId), eq(conversationsTable.userId, userId)),
        with: {
            messages: {
                orderBy: (messagesTable, { asc }) => [asc(messagesTable.order)],
            },
        },
    });

    if (!chat) {
        return null;
    }

    return {
        ...chat,
        messages: chat.messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.parts,
        })),
    };
};

export const getConversations = async (opts: { userId: string }) => {
    const { userId } = opts;

    return await db.query.conversationsTable.findMany({
        where: eq(conversationsTable.userId, userId),
        orderBy: (conversationsTable, { desc }) => [desc(conversationsTable.updatedAt)],
    });
};
