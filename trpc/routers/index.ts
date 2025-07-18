import { createTRPCRouter } from "../init";
import { helloRouter } from "./hello";
import { agentRouter } from "./agent";
import { customActionsRouter } from "./custom-actions";
import { chatInterfaceRouter } from "./chat-interface";

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  agent: agentRouter,
  customActions: customActionsRouter,
  chatInterface: chatInterfaceRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
