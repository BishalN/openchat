import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const helloRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input.text}`,
      };
    }),
});
