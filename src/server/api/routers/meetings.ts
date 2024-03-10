import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';

export const meetingsRouter = createTRPCRouter({
  //get all meetings
  getAllMeetings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.meetings.findMany({
      include: {
        MeetingAttendees: true,
      },
    });
  }),

  getMeetingsForRole: protectedProcedure.query(async ({ ctx }) => {
    const userRole = ctx.session?.user?.role;
    const tutorId = ctx.session?.user?.userId;
    const userSchool = ctx.session?.user?.school;

    switch (userRole) {
      case 'tutor':
        return await ctx.prisma.meetings.findMany({
          where: {
            tutor_id: tutorId,
          },
        });
      case 'principal':
        return await ctx.prisma.meetings.findMany({
          where: {
            MeetingAttendees: {
              some: {
                Students: {
                  school: userSchool,
                },
              },
            },
          },
          include: {
            MeetingAttendees: {
              include: {
                Students: true,
              },
            },
          },
        });
      case 'admin':
        return await ctx.prisma.meetings.findMany();
      default:
        // Handle default case or throw an error
        return [];
    }
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
        tutor_id: z.number().int(),
        attendees: z.array(
          z.object({
            student_id: z.number().int(),
            meeting_status: z.string().optional(),
            created_at: z.date(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const meeting = await ctx.prisma.meetings.create({
          data: {
            start: input.start,
            end: input.end,
            program: input.program,
            level_lesson: input.level_lesson,
            meeting_notes: input.meeting_notes,
            recorded_by: input.recorded_by,
            recorded_on: input.recorded_on,
            tutor_id: input.tutor_id,
          },
        });

        for (const attendee of input.attendees) {
          console.log('attendee from trpc', attendee);
          await ctx.prisma.meetingAttendees.create({
            data: {
              student_id: attendee.student_id,
              meeting_status: attendee.meeting_status,
              meeting_id: meeting.id,
              created_at: attendee.created_at,
            },
          });
        }

        return meeting;
      } catch (error) {
        console.error('Error creating meeting:', error);
        throw new Error('Failed to create meeting and attendees');
      }
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
        tutor_id: z.number().int(),
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
          tutor_id: input.tutor_id,
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

  deleteAttendeesInput: publicProcedure
    .input(
      z.object({
        attendeeIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.meetingAttendees.deleteMany({
          where: {
            id: {
              in: input.attendeeIds,
            },
          },
        });
        return { success: true };
      } catch (error) {
        console.error('Error deleting attendees:', error);
        throw error;
      }
    }),

  // Example tRPC procedure on the server
  getAttendeesByMeeting: publicProcedure
    .input(z.object({ meeting_id: z.number() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.meetingAttendees.findMany({
        where: {
          meeting_id: input.meeting_id,
        },
        select: {
          id: true,
          student_id: true,
          meeting_id: true,
          // any other fields you need
        },
      });
    }),
});
