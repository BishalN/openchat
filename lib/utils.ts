import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function isNewConversationCreated(data: unknown): data is {
  type: "NEW_CONVERSATION_CREATED";
  conversationId: string;
} {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "NEW_CONVERSATION_CREATED" &&
    "conversationId" in data &&
    typeof data.conversationId === "string"
  );
}