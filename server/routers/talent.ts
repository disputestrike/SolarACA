import { z } from "zod";
import { waitlistCityZodEnum } from "@shared/markets";
import { publicProcedure, router } from "../_core/trpc";
import { insertTalentInterest } from "../db";

export const talentRouter = router({
  joinWaitlist: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(100),
        email: z.string().email().max(320),
        city: waitlistCityZodEnum,
      })
    )
    .mutation(async ({ input }) => {
      await insertTalentInterest(input);
      return { success: true as const };
    }),
});
