import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const appSettingsRouter = createTRPCRouter({
    getProgramOptions: publicProcedure.query(async ({ ctx }): Promise<string[]> => {
        const appSettings = await ctx.prisma.appSettings.findFirst();
        return appSettings?.program_options ?? [];
      }),
});
