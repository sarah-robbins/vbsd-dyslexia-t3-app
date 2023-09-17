import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
// import { dummyStudents } from '@prisma/client';

export const studentsRouter = createTRPCRouter({
  //get all students
  getAllStudents: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.dummyStudents.findMany();
  }),

  // getStudentsBySchool
  getStudentsBySchool: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.dummyStudents.findMany({
        where: {
          school: input,
        },
      });
    }),

  //create student
  createStudent: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        school: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        grade: z.string(),
        home_room_teacher: z.string(),
        tutor_ln: z.string(),
        tutor_fn: z.string(),
        intervention_program: z.string(),
        level_lesson: z.string(),
        date_intervention_began: z.date(),
        services: z.string(),
        new_student: z.boolean(),
        moved: z.boolean(),
        new_location: z.string(),
        withdrew: z.boolean(),
        additional_comments: z.string(),
        last_edited: z.date(),
        created_at: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dummyStudents.create({
        data: {
          id: input.id,
          school: input.school,
          first_name: input.first_name,
          last_name: input.last_name,
          grade: input.grade,
          home_room_teacher: input.home_room_teacher,
          tutor_ln: input.tutor_ln,
          tutor_fn: input.tutor_fn,
          intervention_program: input.intervention_program,
          level_lesson: input.level_lesson,
          date_intervention_began: input.date_intervention_began,
          services: input.services,
          new_student: input.new_student,
          moved: input.moved,
          new_location: input.new_location,
          withdrew: input.withdrew,
          additional_comments: input.additional_comments,
          last_edited: input.last_edited,
          created_at: new Date(),
        },
      });
    }),

  //delete student
  deleteStudent: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.dummyStudents.delete({
        where: {
          id: input.id,
        },
      });
    }),

  //update student
  updateStudent: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          school: z.string().optional(),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          grade: z.string().optional(),
          home_room_teacher: z.string().optional(),
          tutor_ln: z.string().optional(),
          tutor_fn: z.string().optional(),
          intervention_program: z.string().optional(),
          level_lesson: z.string().optional(),
          date_intervention_began: z.date().optional(),
          services: z.string().optional(),
          new_student: z.boolean().optional(),
          moved: z.boolean().optional(),
          new_location: z.string().optional().optional(),
          withdrew: z.boolean().optional(),
          additional_comments: z.string().optional().optional(),
          last_edited: z.date().optional(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.dummyStudents.update({
        where: {
          id: input.id,
        },
        data: {
          school: input.school,
          first_name: input.first_name,
          last_name: input.last_name,
          grade: input.grade,
          home_room_teacher: input.home_room_teacher,
          tutor_ln: input.tutor_ln,
          tutor_fn: input.tutor_fn,
          intervention_program: input.intervention_program,
          level_lesson: input.level_lesson,
          date_intervention_began: input.date_intervention_began,
          services: input.services,
          new_student: input.new_student,
          moved: input.moved,
          new_location: input.new_location,
          withdrew: input.withdrew,
          additional_comments: input.additional_comments,
          last_edited: new Date(),
        },
      });
    }),

  // getStudentSchedule
  getScheduleByStudentId: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.dummyStudents.findUnique({
        where: {
          id: input.id,
        },
        select: {
          schedule: true,
        },
      });
    }),

  // add Student schedule
  addStudentSchedule: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        schedule: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.dummyStudents.update({
        where: {
          id: input.id,
        },
        data: {
          schedule: input.schedule,
        },
      });
    }),

  // edit Student schedule
  editStudentSchedule: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          schedule: z.string(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.dummyStudents.update({
        where: {
          id: input.id,
        },
        data: {
          schedule: input.schedule,
        },
      });
    }),
});
