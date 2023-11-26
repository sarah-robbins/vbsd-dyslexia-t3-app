import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const usersRouter = createTRPCRouter({
  //get all users
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.users.findMany({
      include: {
        Students: true,
      },
    });
  }),

  // getUsersBySchool
  getUsersBySchool: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.users.findMany({
        where: {
          school: input,
        },
      });
    }),

  //create user
  createUser: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        first_name: z.string(),
        last_name: z.string(),
        school: z.string(),
        email: z.string(),
        phone: z.string(),
        role: z.string(),
        // super_admin_role: z.string(),
        // picture: z.string(),
        created_at: z.string(),
        view: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.users.create({
        data: {
          id: input.id,
          first_name: input.first_name,
          last_name: input.last_name,
          school: input.school,
          email: input.email,
          phone: input.phone,
          role: input.role,
          // super_admin_role: input.super_admin_role,
          // picture: input.picture,
          created_at: new Date(),
          view: input.view,
        },
      });
    }),

  //delete user
  deleteUser: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.users.delete({
        where: {
          id: input.id,
        },
      });
    }),

  //update user
  updateUser: publicProcedure
    .input(
      z
        .object({
          id: z.number().int(),
          first_name: z.string(),
          last_name: z.string(),
          school: z.string(),
          email: z.string(),
          phone: z.string(),
          role: z.string(),
          // super_admin_role: z.string(),
          // picture: z.string(),
          view: z.string(),
        })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.users.update({
        where: {
          id: input.id,
        },
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          school: input.school,
          email: input.email,
          phone: input.phone,
          role: input.role,
          // super_admin_role: input.super_admin_role,
          // picture: input.picture,
          view: input.view,
        },
      });
    }),
});
