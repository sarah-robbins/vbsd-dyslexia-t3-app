import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const meetingsRouter = createTRPCRouter({
  getAllMeetings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.meetings.findMany({
      include: {
        MeetingAttendees: true,
      },
    });
  }),

  getMeetingsForRole: protectedProcedure.query(async ({ ctx }) => {
    // const userRole = ctx.session?.user?.role;
    const userRoles = ctx.session?.user?.role?.split(',').map(role => role.trim().toLowerCase()) || [];
    const tutorId = ctx.session?.user?.userId;
    const userSchools = ctx.session?.user?.school?.split(',').map(school => school.trim()) || [];

      // Convert roles to a ranked list (higher index = higher priority)
      const rolesHierarchy = ['tutor', 'principal', 'admin'];
      // const highestRole = rolesHierarchy.find(role => userRole?.toLowerCase().includes(role));
      const highestRole = rolesHierarchy.reduce((highest, role) => 
        userRoles.includes(role) && rolesHierarchy.indexOf(role) > rolesHierarchy.indexOf(highest) ? role : highest
      , '');

      switch (highestRole) {
      case 'tutor':
        return await ctx.prisma.meetings.findMany({
          where: {
            tutor_id: tutorId,
          },
          include: {
            MeetingAttendees: {
              select: {
                id: true,
                meeting_status: true,
                name: true,
                student_id: true,
                created_at: true,
                tutor_id: true,
              },
            },
          },

        });
      case 'principal':
        return await ctx.prisma.meetings.findMany({
          where: {
            MeetingAttendees: {
              some: {
                Students: {
                  school: {
                    in: userSchools.flatMap(school => [school, ...school.split(' ')])
                  },
                },
              },
            },
          },
          include: {
            MeetingAttendees: {
              select: {
                id: true,
                meeting_status: true,
                name: true,
                student_id: true,
                created_at: true,
                tutor_id: true,
              },
            },
          },
      });
      case 'admin':
        return await ctx.prisma.meetings.findMany({
          include: {
            MeetingAttendees: {
              select: {
                id: true,
                meeting_status: true,
                name: true,
                student_id: true,
                created_at: true,
                tutor_id: true,
              },
            },
          },

        });
      default:
        // Handle default case or throw an error
        return [];
    }
  }),

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
          MeetingAttendees: {
            select: {
              id: true,
              meeting_status: true,
              name: true,
              student_id: true,
              created_at: true,
              tutor_id: true,
            },
          },
      },
      });
    }),

  addAttendee: publicProcedure
    .input(
      z.object({
        meeting_id: z.number(),
        student_id: z.number(),
        meeting_status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.meetingAttendees.create({
        data: {
          meeting_id: input.meeting_id,
          student_id: input.student_id,
          meeting_status: input.meeting_status ?? '',
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
    .input(z.object({ tutor_id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.meetings.findMany({
        where: {
          tutor_id: input.tutor_id,
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
          await ctx.prisma.meetingAttendees.create({
            data: {
              student_id: attendee.student_id,
              meeting_status: attendee.meeting_status ?? '',
              meeting_id: meeting.id,
              created_at: attendee.created_at,
            },
          });
        }
        
        return { meeting, success: true};
        // return meeting;
      } catch (error) {
        console.error('Error creating meeting:', error);
        throw new Error('Failed to create meeting and attendees');
      }

    }),

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

    updateMeeting: publicProcedure
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
      const meeting = await ctx.prisma.meetings.update({
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
  
      // Get current attendees from the database
      const currentAttendees = await ctx.prisma.meetingAttendees.findMany({
        where: {
          meeting_id: input.id,
        },
      });
  
      // Update or create attendees
      for (const attendee of input.attendees) {
        const existingAttendee = currentAttendees.find(
          (a) => a.student_id === attendee.student_id
        );
  
        if (existingAttendee) {
          // Update existing attendee
          await ctx.prisma.meetingAttendees.update({
            where: {
              id: existingAttendee.id,
            },
            data: {
              meeting_status: attendee.meeting_status,
            },
          });
        } else {
          // Create new attendee
          await ctx.prisma.meetingAttendees.create({
            data: {
              meeting_id: input.id,
              student_id: attendee.student_id,
              meeting_status: attendee.meeting_status ?? '',
            },
          });
        }
      }
  
      // Delete attendees that are no longer in the updated list
      const updatedAttendeeIds = input.attendees.map((a) => a.student_id);
      const attendeesToDelete = currentAttendees.filter(
        (a) => !updatedAttendeeIds.includes(a.student_id)
      );
  
      for (const attendee of attendeesToDelete) {
        await ctx.prisma.meetingAttendees.delete({
          where: {
            id: attendee.id,
          },
        });
      }
  
      return { meeting, success: true };
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

  getMeetingsByRoleAndDate: publicProcedure
    .input(z.date())
    .query(async ({ ctx, input }) => {
      // Date filtering logic
      const startDate = new Date(input);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(input);
      endDate.setHours(23, 59, 59, 999);
      const userRole = ctx.session?.user?.role;
      const tutorId = ctx.session?.user?.userId;
      const userSchool = ctx.session?.user?.school;
    
      // Convert roles to a ranked list (higher index = higher priority)
      const rolesHierarchy = ['tutor', 'principal', 'admin'];
      const highestRole = rolesHierarchy.find(role => userRole?.toLowerCase().includes(role));
    
      switch (highestRole) {
        case 'tutor':
          return await ctx.prisma.meetings.findMany({
            where: {
              AND: [
                { tutor_id: tutorId },
                { start: { gte: startDate, lte: endDate } },
              ],
            },
            include: {
              MeetingAttendees: {
                select: {
                  id: true,
                  meeting_status: true,
                  name: true,
                  student_id: true,
                  created_at: true,
                  tutor_id: true,
                },
              },
            },
          });
        case 'principal':
          return await ctx.prisma.meetings.findMany({
            where: {
              AND: [
                {
                  MeetingAttendees: {
                    some: {
                      Students: {
                        school: userSchool,
                      },
                    },
                  },
                },
                { start: { gte: startDate, lte: endDate } },
              ],
            },
            include: {
              MeetingAttendees: {
                select: {
                  id: true,
                  meeting_status: true,
                  name: true,
                  student_id: true,
                  created_at: true,
                  tutor_id: true,
                },
              },
          },
              });
        case 'admin':
          return await ctx.prisma.meetings.findMany({
            where: {
              start: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              MeetingAttendees: {
                select: {
                  id: true,
                  meeting_status: true,
                  name: true,
                  student_id: true,
                  created_at: true,
                  tutor_id: true,
                },
              },
          },
              });
        default:
          // If no recognized role is found, you might want to throw an error
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized access' });
      }
    }),
});

