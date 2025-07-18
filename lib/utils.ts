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

// Function to extract query parameters from URL
export function extractQueryParameters(url: string): Array<{ key: string; value: string }> {
  try {
    const urlObj = new URL(url);
    const params: Array<{ key: string; value: string }> = [];

    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });

    return params;
  } catch (error) {
    // If URL is invalid, return empty array
    return [];
  }
}

// Function to build URL with parameters
export function buildUrlWithParams(baseUrl: string, parameters: Array<{ key: string; value: string }>): string {
  try {
    const urlObj = new URL(baseUrl);

    // Clear existing search params
    urlObj.search = '';

    // Add parameters
    parameters.forEach(({ key, value }) => {
      if (key && value) {
        urlObj.searchParams.append(key, value);
      }
    });

    return urlObj.toString();
  } catch (error) {
    // If URL is invalid, return original URL
    return baseUrl;
  }
}

// Function to get base URL without parameters
export function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch (error) {
    // If URL is invalid, return original URL
    return url;
  }
}

export function flattenJson(obj: any, prefix = "", res: Record<string, string> = {}) {
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      flattenJson(obj[key], prefix ? `${prefix}.${key}` : key, res);
    } else {
      res[prefix ? `${prefix}.${key}` : key] = String(obj[key]);
    }
  }
  return res;
}