import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const attendeesRouter = createTRPCRouter({
  //create user
  createAttendee: publicProcedure
    .input(
      z.object({
        meeting_id: z.number().int(),
        student_id: z.number().int(),
        meeting_status: z.string().optional(),
        created_at: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.meetingAttendees.create({
        data: {
          student_id: input.student_id,
          meeting_id: input.meeting_id,
          meeting_status: input.meeting_status ?? '',
          created_at: new Date(),
        },
      });
    }),

  //delete user
  deleteAttendee: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.meetingAttendees.delete({
        where: {
          id: input.id,
        },
      });
    }),

  //update user
  updateAttendee: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          student_id: z.number().int(),
          meeting_id: z.number().int(),
          meeting_status: z.string(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.meetingAttendees.update({
        where: {
          id: input.id,
        },
        data: {
          student_id: input.student_id,
          meeting_id: input.meeting_id,
          meeting_status: input.meeting_status,
        },
      });
    }),
});
