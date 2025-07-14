import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { db } from "@/drizzle";
import { createClient } from "@/utils/supabase/server";

// Context provider
export const createTRPCContext = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    db,
    user: user || null,
    supabase,
  };
});

// tRPC initialization
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Auth middleware - use this for protected routes
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Protected procedure for authenticated routes
export const protectedProcedure = t.procedure.use(authMiddleware);
