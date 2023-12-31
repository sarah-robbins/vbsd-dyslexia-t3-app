import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { type Meeting } from '@/types';

export const meetingsRouter = createTRPCRouter({
  //get all meetings
  getAllMeetings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.meetings.findMany({
      include: {
        MeetingAttendees: true,
      },
    });
  }),

  // getAllAttendees: publicProcedure.query(async ({ ctx }) => {
  //   return await ctx.prisma.meetingAttendees.findMany();
  // }),

  // getAttendeesByStudent
  // getAttendeesByStudent: publicProcedure
  //   .input(z.number().int())
  //   .query(async ({ ctx, input }) => {
  //     return await ctx.prisma.meetingAttendees.findMany({
  //       where: {
  //         student_id: input,
  //       },
  //     });
  //   }),

  // getAttendeesByMeeting
  // getAttendeesByMeeting: publicProcedure
  //   .input(z.number().int())
  //   .query(async ({ ctx, input }) => {
  //     return await ctx.prisma.meetingAttendees.findMany({
  //       where: {
  //         meeting_id: input,
  //       },
  //     });
  //   }),

  // getMeetingsByDate
  getMeetingsByDate: publicProcedure
    .input(z.date())
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(input);
      endDate.setHours(23, 59, 59, 999);

      return await ctx.prisma.meetings.findMany({
        where: {
          start: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          MeetingAttendees: true,
        },
      });
    }),

  addAttendee: publicProcedure
    .input(
      z.object({
        meeting_id: z.number(),
        student_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.meetingAttendees.create({
        data: {
          meeting_id: input.meeting_id,
          student_id: input.student_id,
        },
      });
    }),

  getMeetingAttendees: publicProcedure
    .input(
      z.object({
        meetingId: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.meetings.findUnique({
        where: {
          id: input.meetingId,
        },
        include: {
          MeetingAttendees: true,
        },
      });
    }),

  getMeetingById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.meetings.findUnique({
        where: {
          id: input.id,
        },
        include: {
          MeetingAttendees: true,
        },
      });
    }),

  // getMeetingsBySchool: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     return ctx.prisma.meetings.findUnique({
  //       where: {
  //         MeetingAttendees.student.id: input,
  //       },
  //       include: {
  //         MeetingAttendees: true,
  //       },
  //     });
  //   }),

  getMeetingsByStudentId: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.meetings.findMany({
        where: {
          MeetingAttendees: {
            some: {
              student_id: input.studentId,
            },
          },
        },
        include: {
          MeetingAttendees: true,
        },
      });
    }),

  getMeetingsByTutorId: publicProcedure
    .input(z.object({ tutorId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.meetings.findMany({
        where: {
          MeetingAttendees: {
            some: {
              Students: {
                tutor_id: input.tutorId,
              },
            },
          },
        },
        include: {
          MeetingAttendees: true,
        },
      });
    }),

  getMeetingsBySchool: publicProcedure
    .input(z.object({ school: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.meetings.findMany({
        where: {
          MeetingAttendees: {
            some: {
              Students: {
                school: input.school,
              },
            },
          },
        },
        include: {
          MeetingAttendees: true,
        },
      });
    }),

  // getMeetingsForTutor: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     return ctx.prisma.meetings.findUnique({
  //       where: {
  //         id: input.id,
  //       },
  //       include: {
  //         MeetingAttendees: true,
  //       },
  //     });
  //   }),

  //create meeting
  createMeeting: publicProcedure
    .input(
      z.object({
        start: z.date(),
        end: z.date(),
        program: z.string().optional(),
        level_lesson: z.string().optional(),
        meeting_notes: z.string().optional(),
        recorded_by: z.string(),
        recorded_on: z.date(),
        attendees: z.array(
          z.object({
            student_id: z.number().int(),
            meeting_status: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.prisma.meetings.create({
        data: {
          start: input.start,
          end: input.end,
          program: input.program,
          level_lesson: input.level_lesson,
          meeting_notes: input.meeting_notes,
          recorded_by: input.recorded_by,
          recorded_on: input.recorded_on,
        },
      });

      for (const attendee of input.attendees) {
        await ctx.prisma.meetingAttendees.create({
          data: {
            meeting_id: meeting.id,
            student_id: attendee.student_id,
            meeting_status: attendee.meeting_status,
          },
        });
      }

      return meeting;
    }),

  //delete meeting
  deleteMeeting: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.meetings.delete({
        where: {
          id: input.id,
        },
      });
    }),

  //update meeting
  editMeeting: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        start: z.date(),
        end: z.date(),
        program: z.string().optional(),
        level_lesson: z.string().optional(),
        meeting_notes: z.string().optional(),
        edited_by: z.string(),
        edited_on: z.date(),
        attendees: z.array(
          z.object({
            student_id: z.number().int(),
            meeting_status: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update meeting details
      await ctx.prisma.meetings.update({
        where: {
          id: input.id,
        },
        data: {
          start: input.start,
          end: input.end,
          program: input.program,
          level_lesson: input.level_lesson,
          meeting_notes: input.meeting_notes,
          edited_by: input.edited_by,
          edited_on: input.edited_on,
        },
      });

      // Update attendees
      for (const attendee of input.attendees) {
        const existingAttendee = await ctx.prisma.meetingAttendees.findFirst({
          where: {
            meeting_id: input.id,
            student_id: attendee.student_id,
          },
        });

        if (existingAttendee) {
          await ctx.prisma.meetingAttendees.update({
            where: {
              id: existingAttendee.id,
            },
            data: {
              meeting_status: attendee.meeting_status,
            },
          });
        } else {
          await ctx.prisma.meetingAttendees.create({
            data: {
              meeting_id: input.id,
              student_id: attendee.student_id,
              meeting_status: attendee.meeting_status,
            },
          });
        }
      }

      return { success: true };
    }),
});
