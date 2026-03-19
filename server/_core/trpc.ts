import { NOT_ADMIN_ERR_MSG, NOT_PERMISSION_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { hasAdminPermission, type AdminPermission } from "@shared/permissions";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/** Admin session + specific capability (see shared/permissions.ts). */
export function createPermissionProcedure(permission: AdminPermission) {
  return t.procedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }
      if (
        ctx.user.role !== "admin" ||
        !hasAdminPermission(
          ctx.user.role,
          ctx.user.adminTier ?? null,
          ctx.user.adminPermissions ?? null,
          permission
        )
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: NOT_PERMISSION_ERR_MSG });
      }
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    })
  );
}
