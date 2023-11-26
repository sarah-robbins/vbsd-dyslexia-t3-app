import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const attendeesRouter = createTRPCRouter({
  //get all users
  getAllAttendees: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.meetingAttendees.findMany();
  }),

  // getAttendeesByStudent
  getAttendeesByStudent: publicProcedure
    .input(z.number().int())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.meetingAttendees.findMany({
        where: {
          student_id: input,
        },
      });
    }),

  // getAttendeesByMeeting
  getAttendeesByMeeting: publicProcedure
    .input(z.number().int())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.meetingAttendees.findMany({
        where: {
          meeting_id: input,
        },
      });
    }),

  //create user
  createAttendee: publicProcedure
    .input(
      z.object({
        student_id: z.number().int(),
        meeting_id: z.number().int(),
        meeting_status: z.string(),
        created_at: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.meetingAttendees.create({
        data: {
          student_id: input.student_id,
          meeting_id: input.meeting_id,
          meeting_status: input.meeting_status,
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
