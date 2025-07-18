import { z } from "zod";

export const chatInterfaceSchema = z.object({
    displayName: z.string().optional(),
    profilePicture: z.any().optional(), // File or string (URL) // Blob type
    chatBubbleTriggerIcon: z.any().optional(), // File or string (URL) // Blob type
    userMessageColor: z.string().optional(),
    syncUserMessageColorWithAgentHeader: z.boolean(),
    chatBubbleButtonColor: z.string().optional(),
    initialMessages: z.string().optional(),
    suggestedMessages: z.array(z.object({ value: z.string() })),
    messagePlaceholder: z.string().optional(),
    footer: z.string().optional(),
    dismissibleNotice: z.string().optional(),
});

export type ChatInterfaceFormValues = z.infer<typeof chatInterfaceSchema>;