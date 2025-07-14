import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";

const eventsMap = {
  "agent/pipeline.create": {
    data: z.object({
      agentId: z.number(),
      sources: z.object({
        text: z
          .object({
            id: z.number(),
            content: z.string(),
            name: z.string(),
            size: z.number().optional(),
          })
          .nullable(),
        files: z.array(
          z.object({
            id: z.number(),
            fileUrl: z.string().url(),
            mimeType: z.string(),
            name: z.string(),
            fileSize: z.number().optional(),
          })
        ),
        websites: z.array(
          z.object({
            id: z.number(),
            url: z.string().url(),
            name: z.string(),
          })
        ),
        qa: z
          .object({
            id: z.number(),
            qaPairs: z.array(
              z.object({
                question: z.string(),
                answer: z.string(),
              })
            ),
            name: z.string(),
            size: z.number().optional(),
          })
          .nullable(),
        notion: z
          .object({
            id: z.number(),
            url: z.string().url(),
            name: z.string(),
          })
          .nullable(),
      }),
    }),
  },
};

export const inngest = new Inngest({
  id: "agent-creation",
  schemas: new EventSchemas().fromZod(eventsMap),
});
