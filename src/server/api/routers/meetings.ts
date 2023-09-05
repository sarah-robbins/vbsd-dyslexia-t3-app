import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const meetingsRouter = createTRPCRouter({
  //get all meetings
  getAllMeetings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.dummyMeetings.findMany();
  }),

  // getMeetingsByDate
  getMeetingsByDate: publicProcedure
    .input(z.date())
    .query(async ({ ctx, input }) => {
      console.log('input value from meetings.tx: ', input);
      const startDate = new Date(input);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(input);
      endDate.setHours(23, 59, 59, 999);

      return await ctx.prisma.dummyMeetings.findMany({
        where: {
          start: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    }),

  //create meeting
  createMeeting: publicProcedure
    .input(
      z.object({
        name: z.string(),
        student_id: z.number().int(),
        start: z.date(),
        end: z.date(),
        meeting_status: z.string(),
        program: z.string(),
        level_lesson: z.string(),
        meeting_notes: z.string(),
        recorded_by: z.string(),
        recorded_on: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dummyMeetings.create({
        data: {
          name: input.name,
          student_id: input.student_id,
          start: input.start,
          end: input.end,
          meeting_status: input.meeting_status,
          program: input.program,
          level_lesson: input.level_lesson,
          meeting_notes: input.meeting_notes,
          recorded_by: input.recorded_by,
          recorded_on: input.recorded_on,
        },
      });
    }),

  //delete meeting
  deleteMeeting: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.dummyMeetings.delete({
        where: {
          id: input.id,
        },
      });
    }),

  //update meeting
  editMeeting: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          name: z.string(),
          student_id: z.number().int(),
          start: z.date(),
          end: z.date(),
          meeting_status: z.string(),
          program: z.string(),
          level_lesson: z.string(),
          meeting_notes: z.string(),
          edited_by: z.string(),
          edited_on: z.date(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.dummyMeetings.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          student_id: input.student_id,
          start: input.start,
          end: input.end,
          meeting_status: input.meeting_status,
          program: input.program,
          level_lesson: input.level_lesson,
          meeting_notes: input.meeting_notes,
          edited_by: input.edited_by,
          edited_on: input.edited_on,
        },
      });
    }),
});
