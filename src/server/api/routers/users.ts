import { z } from 'zod';
import {   createTRPCRouter,
  publicProcedure,
  protectedProcedure,
 } from '@/server/api/trpc';

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

  
  getUsersForRole: protectedProcedure.query(async ({ ctx }) => {
    const userRole = ctx.session?.user?.role;
    const userSchool = ctx.session?.user?.school;

    let highestPriorityRole = '';

    if (userRole.includes('Admin' || 'admin')) {
      highestPriorityRole = 'Admin';
    } else if (userRole.includes('Principal' || 'principal')) {
      highestPriorityRole = 'Principal';
    } else if (userRole.includes('Tutor' || 'tutor')) {
      highestPriorityRole = 'Tutor';
    }
    switch (highestPriorityRole) {
      case 'tutor':
      case "Tutor":
        return await ctx.prisma.users.findMany({
          where: {
            school: {
              in: Array.isArray(userSchool) ? userSchool : [userSchool], // userSchool should be an array of school names
            },
          },
        });
      case 'Principal':
      case 'principal':
        return await ctx.prisma.users.findMany({
          where: {
            school: {
              in: Array.isArray(userSchool) ? userSchool : [userSchool], // userSchool should be an array of school names
            },
          },
        });
      case 'admin':
      case "Admin":
          return await ctx.prisma.users.findMany({
        });
      default:
        // Handle default case or throw an error
        return [];
    }
  }),

  //create user
  createUser: publicProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        school: z.string(),
        email: z.string(),
        phone: z.string(),
        role: z.string(),
        created_at: z.date(),
        view: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.users.create({
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          school: input.school,
          email: input.email,
          phone: input.phone,
          role: input.role,
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
          view: input.view,
        },
      });
    }),
});
