import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";

export const sourcesSchema = z.object({
  text: z
    .object({
      id: z.string(), // uuid
      content: z.string(),
      name: z.string(),
    })
    .nullable(),
  files: z.array(
    z.object({
      id: z.string(), // uuid
      fileUrl: z.string().url(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      name: z.string(),
    })
  ).nullable(),
  websites: z.array(
    z.object({
      id: z.string(), // uuid
      name: z.string(),
      content: z.string(),
      url: z.string().url(),
    })
  ).nullable(),
  qa: z
    .object({
      id: z.string(), // uuid
      pairs: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      ),
      name: z.string(),
    })
    .nullable(),
})
export type Sources = z.infer<typeof sourcesSchema>;

export type FileSources = z.infer<typeof sourcesSchema.shape.files>;
export type FileSource = {
  id: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  name: string;
}
export type TextSource = z.infer<typeof sourcesSchema.shape.text>;
export type QASource = z.infer<typeof sourcesSchema.shape.qa>;
export type WebsiteSources = z.infer<typeof sourcesSchema.shape.websites>;
export type WebsiteSource = {
  id: string;
  name: string;
  content: string;
  url: string;
}

export const eventsMap = {
  "agent/pipeline.create": {
    data: z.object({
      agentId: z.string(), // uuid
      sources: sourcesSchema,
    }),
  },
};

export const inngest = new Inngest({
  id: "agent-creation",
  schemas: new EventSchemas().fromZod(eventsMap),
});
