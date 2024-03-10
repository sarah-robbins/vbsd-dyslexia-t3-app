import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const settingsRouter = createTRPCRouter({
  //get all settings
  getAllSettings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.appSettings.findMany({});
  }),

  //create setting
  createSetting: publicProcedure
    .input(
      z.object({
        school_name: z.string(),
        primary_color: z.string(),
        school_options: z.string(),
        meeting_status_options: z.string(),
        user_role_options: z.string(),
        initial_view_options: z.string(),
        grade_options: z.string(),
        program_options: z.string(),
        services_options: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.appSettings.create({
        data: {
          school_name: input.school_name,
          primary_color: input.primary_color,
          school_options: input.school_options.split(','),
          meeting_status_options: input.meeting_status_options.split(','),
          user_role_options: input.user_role_options.split(','),
          initial_view_options: input.initial_view_options.split(','),
          grade_options: input.grade_options.split(','),
          program_options: input.program_options.split(','),
          services_options: input.services_options.split(','),
        },
      });
    }),

  //delete setting
  deleteSetting: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.appSettings.delete({
        where: {
          id: input.id,
        },
      });
    }),

  //update setting
  updateSetting: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          school_name: z.string(),
          primary_color: z.string(),
          school_options: z.string(),
          meeting_status_options: z.string(),
          user_role_options: z.string(),
          initial_view_options: z.string(),
          grade_options: z.string(),
          program_options: z.string(),
          services_options: z.string(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.appSettings.update({
        where: {
          id: input.id,
        },
        data: {
          school_name: input.school_name,
          primary_color: input.primary_color,
          school_options: input.school_options?.split(','),
          meeting_status_options: input.meeting_status_options?.split(','),
          user_role_options: input.user_role_options?.split(','),
          initial_view_options: input.initial_view_options?.split(','),
          grade_options: input.grade_options?.split(','),
          program_options: input.program_options?.split(','),
          services_options: input.services_options?.split(','),
        },
      });
    }),
});
