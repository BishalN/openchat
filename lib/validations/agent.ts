import { z } from "zod";

// Base schemas for each source type
export const textSourceSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
  name: z.string(),
  size: z.number().int().positive(),
});

export const fileSourceSchema = z.object({
  id: z.string(),
  type: z.literal("file"),
  name: z.string(),
  fileUrl: z.string().url().optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  createdAt: z.number().optional(),
});

export const websiteSourceSchema = z.object({
  type: z.literal("website"),
  name: z.string(),
  content: z.string().optional(),
  url: z.string().url().optional(),
});

export const qaPairSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const qaSourceSchema = z.object({
  type: z.literal("qa"),
  name: z.string(),
  qaPairs: z.array(qaPairSchema),
  size: z.number().int().positive(),
});

// Main source store state schema
export const sourceStoreSchema = z.object({
  text: textSourceSchema.nullable(),
  file: z.array(fileSourceSchema),
  websites: z.array(websiteSourceSchema),
  qa: qaSourceSchema.nullable(),
});

// If you want to infer types back from Zod
export type SourceStore = z.infer<typeof sourceStoreSchema>;
export type TextSource = z.infer<typeof textSourceSchema>;
export type FileSource = z.infer<typeof fileSourceSchema>;
export type WebsiteSource = z.infer<typeof websiteSourceSchema>;
export type QASource = z.infer<typeof qaSourceSchema>;