import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { type GetServerSidePropsContext } from 'next';
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      userId: number;
      role: string;
      view: string;
      school: string;
      phone: string | null;
    } & DefaultSession['user'];
  }
}
interface UsersList {
  id: number;
  first_name: string | null;
  last_name: string | null;
  school: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  super_admin_role: string | null;
  picture: string | null;
  created_at: Date | null;
  view: string | null;

  // ...other properties
  // role: UserRole;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      const userFromDb = await prisma.users.findFirst({
        where: { email: user.email },
      });
      const appSettings = await prisma.appSettings.findFirst();

      if (userFromDb !== undefined) {
        return {
          ...session,
          user: {
            ...user,
            // id: user.id,
            userId: (userFromDb as UsersList).id,
            role: (userFromDb as UsersList).role,
            view: (userFromDb as UsersList).view,
            school: (userFromDb as UsersList).school,
            phone: (userFromDb as UsersList).phone,
          },
          appSettings: appSettings,
        };
      } else {
        // Handle the case where userFromDb is undefined, possibly returning a session with default values or an error.
        return session;
      }
    },
    // Add signIn callback here
    async signIn({ user }) {
      if (!user.email) {
        // Log the issue, return an error, or handle as appropriate
        console.error("User email is undefined or null");
        return false; // Prevent the sign-in
      }
      const isUserAllowedToSignIn = await prisma.users.findMany({
        where: { email: user.email },
      });

      if (isUserAllowedToSignIn) {
        return true; // Continue the sign-in process
      } else {
        // Optionally, log the attempted sign-in or notify an admin here
        return false; // Prevent the sign-in
      }
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
