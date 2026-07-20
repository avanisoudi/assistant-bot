import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { deployBot, stopBot, getBotStatus, clearLogs } from "./bot-manager";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  bot: router({
    // Get current bot status
    status: protectedProcedure.query(async ({ ctx }) => {
      return getBotStatus(ctx.user.id);
    }),

    // Deploy bot with a phone number
    deploy: protectedProcedure
      .input(z.object({ phoneNumber: z.string().min(8).max(15) }))
      .mutation(async ({ ctx, input }) => {
        const result = await deployBot(ctx.user.id, input.phoneNumber);
        return result;
      }),

    // Stop the bot
    stop: protectedProcedure.mutation(async ({ ctx }) => {
      await stopBot(ctx.user.id);
      return { success: true };
    }),

    // Clear logs
    clearLogs: protectedProcedure.mutation(async ({ ctx }) => {
      clearLogs(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
