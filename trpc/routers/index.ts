import { createTRPCRouter } from "../init";
import { helloRouter } from "./hello";
import { agentRouter } from "./agent";

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  agent: agentRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
