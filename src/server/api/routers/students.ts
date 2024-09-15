import { z } from 'zod';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc';

export const studentsRouter = createTRPCRouter({
  getAllStudents: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.students.findMany({
      include: {
        Users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        MeetingAttendees: {
          select: {
            id: true,
            meeting_status: true,
          },
        },
      },
    });
  }),

  getStudentsForRole: protectedProcedure.query(async ({ ctx }) => {
    const userRole = ctx.session?.user?.role;
    const tutorId = ctx.session?.user?.userId;
    const userSchool = ctx.session?.user?.school;
  
    let highestPriorityRole = '';
  
    if (userRole.toLowerCase().includes('admin')) {
      highestPriorityRole = 'admin';
    } else if (userRole.toLowerCase().includes('principal')) {
      highestPriorityRole = 'principal';
    } else if (userRole.toLowerCase().includes('tutor')) {
      highestPriorityRole = 'tutor';
    }
  
    const includeOptions = {
      Users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      MeetingAttendees: {
        select: {
          id: true,
          meeting_status: true,
          Meetings: {
            select: {
              id: true, 
              start: true,
              level_lesson: true,
              MeetingAttendees: {
                where: {
                  student_id: {
                    not: undefined,
                  },
                },
                select: {
                  student_id: true,
                },
              },
            }
          }
        },
      },
    };
  
    switch (highestPriorityRole) {
      case 'tutor':
        return await ctx.prisma.students.findMany({
          where: {
            tutor_id: tutorId,
          },
          include: includeOptions,
        });
      case 'principal':
        const sessionUserSchools = userSchool.split(',').map(s => s.trim());
        return await ctx.prisma.students.findMany({
          where: {
            school: {
              in: sessionUserSchools,
            },
          },
          include: includeOptions,
        });
      case 'admin':
      default:
        return await ctx.prisma.students.findMany({
          include: includeOptions,
        });
    }
  }),
  
  getStudentsBySchool: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.students.findMany({
        where: {
          school: input,
        },
        include: {
          Users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          MeetingAttendees: {
            select: {
              id: true,
              meeting_status: true,
            },
          },
        },
      });
    }),

  getStudentsById: publicProcedure
    .input(z.number().int())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.students.findMany({
        where: {
          id: input,
        },
        include: {
          Users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          MeetingAttendees: {
            select: {
              id: true,
              meeting_status: true,
            },
          },
        },
      });
    }),

  getStudentsForTutor: publicProcedure
    .input(z.number().int())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.students.findMany({
        where: {
          tutor_id: input,
        },
        include: {
          Users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          MeetingAttendees: {
            select: {
              id: true,
              meeting_status: true,
              Meetings: {
                select: {
                    id: true, 
                    start: true,
                    level_lesson: true
                }
              }
            },
          },
      },
      });
    }),

  createStudent: publicProcedure
    .input(
      z.object({
        school: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        student_assigned_id: z.string().optional(),
        grade: z.string().optional(),
        home_room_teacher: z.string().optional(),
        tutor_id: z.number().int().nullable().optional(),
        intervention_program: z.string().optional(),
        services: z.string().optional(),
        new_student: z.boolean().optional(),
        date_intervention_began: z.date().optional(),
        level_lesson: z.string().optional(),
        moved: z.boolean().optional(),
        new_location: z.string().optional(),
        withdrew: z.boolean().optional(),
        graduated: z.boolean().optional(),
        additional_comments: z.string().optional(),
        created_at: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.students.create({
        data: {
          school: input.school,
          first_name: input.first_name,
          last_name: input.last_name,
          student_assigned_id: input.student_assigned_id,
          grade: input.grade,
          home_room_teacher: input.home_room_teacher,
          tutor_id: input.tutor_id,
          intervention_program: input.intervention_program,
          services: input.services,
          date_intervention_began: input.date_intervention_began,
          level_lesson: input.level_lesson,
          moved: input.moved,
          new_location: input.new_location,
          withdrew: input.withdrew,
          graduated: input.graduated,
          additional_comments: input.additional_comments,
          new_student: input.new_student,
        },
      });
    }),

  deleteStudent: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.students.delete({
        where: {
          id: input.id,
        },
      });
    }),

  updateStudentRow: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          school: z.string().optional(),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          student_assigned_id: z.string().optional(),
          grade: z.string().optional(),
          home_room_teacher: z.string().optional(),
          tutor_id: z.number().int().nullable(),
          intervention_program: z.string().optional(),
          services: z.string().optional(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.students.update({
        where: {
          id: input.id,
        },
        data: {
          school: input.school,
          first_name: input.first_name,
          last_name: input.last_name,
          student_assigned_id: input.student_assigned_id,
          grade: input.grade,
          home_room_teacher: input.home_room_teacher,
          tutor_id: input.tutor_id,
          intervention_program: input.intervention_program,
          services: input.services,
        },
      });
    }),

  updateStudentExtraData: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          level_lesson: z.string().optional().nullable(),
          date_intervention_began: z.date().optional().nullable(),
          new_student: z.boolean().optional(),
          moved: z.boolean().optional(),
          new_location: z.string().optional().nullable(),
          withdrew: z.boolean().optional(),
          graduated: z.boolean().optional(),
          additional_comments: z.string().optional().nullable(),
          last_edited: z.date().optional(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.students.update({
        where: {
          id: input.id,
        },
        data: {
          level_lesson: input.level_lesson,
          date_intervention_began: input.date_intervention_began,
          new_student: input.new_student,
          moved: input.moved,
          new_location: input.new_location,
          withdrew: input.withdrew,
          graduated: input.graduated,
          additional_comments: input.additional_comments,
          last_edited: new Date(),
        },
      });
    }),
});
