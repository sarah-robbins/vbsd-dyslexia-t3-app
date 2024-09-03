import { exampleRouter } from '@/server/api/routers/example';
import { createTRPCRouter } from '@/server/api/trpc';
import { studentsRouter } from './routers/students';
import { meetingsRouter } from './routers/meetings';
import { usersRouter } from './routers/users';
import { attendeesRouter } from './routers/attendees';
import { settingsRouter } from './routers/settings';
import { appSettingsRouter } from './routers/appSettings';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  students: studentsRouter,
  meetings: meetingsRouter,
  users: usersRouter,
  attendees: attendeesRouter,
  settings: settingsRouter,
  appSettings: appSettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
