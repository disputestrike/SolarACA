import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { serializeMeUser } from "./_core/me";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { applicantsRouter } from "./routers/applicants";
import { communicationsRouter } from "./routers/communications";
import { interviewsRouter } from "./routers/interviews";
import { staffRouter } from "./routers/staff";
import { talentRouter } from "./routers/talent";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  applicants: applicantsRouter,
  communications: communicationsRouter,
  interviews: interviewsRouter,
  staff: staffRouter,
  talent: talentRouter,
  auth: router({
    me: publicProcedure.query(opts => (opts.ctx.user ? serializeMeUser(opts.ctx.user) : null)),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
