// // extendedPrismaClient.ts
// import { PrismaClient, type Prisma } from '@prisma/client';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
// import type { Meeting } from '@/types';  // Assuming this defines 'start' and 'end' as 'Dayjs | Date | null'

// dayjs.extend(utc);
// dayjs.extend(timezone);

// class ExtendedPrismaClient extends PrismaClient {
//     clientTimezone = 'America/Chicago';

//     async findMeetingsWithLocalDates(args?: Prisma.MeetingsFindManyArgs): Promise<Meeting[]> {
//         const meetings = await this.meetings.findMany(args);
//         return meetings.map(meeting => this.convertDateFieldsToLocal(meeting as unknown as Meeting));
//     }

//     async createMeetingWithUTCDate(data: Prisma.MeetingsCreateInput): Promise<Meeting> {
//         const newData = this.convertDateFieldsToUTC(data as unknown as Meeting);
//         return this.meetings.create({ data: newData as Prisma.MeetingsCreateInput });
//     }

//     convertDateFieldsToLocal(meeting: Meeting): Meeting {
//         return this.convertDateFields(meeting, false);
//     }

//     convertDateFieldsToUTC(meeting: Meeting): Meeting {
//         return this.convertDateFields(meeting, true);
//     }

//     private convertDateFields(meeting: Meeting, toUTC: boolean): Meeting {
//         const keys: (keyof Meeting)[] = ['start', 'end'];
//         keys.forEach(key => {
//             const dateValue = meeting[key];
//             if (dateValue instanceof Date || typeof dateValue === 'string') {
//                 const date = new Date(dateValue);
//                 meeting[key] = toUTC
//                     ? dayjs(date).tz(this.clientTimezone, true).utc().toDate()
//                     : dayjs(date).tz(this.clientTimezone).toDate();
//             }
//         });
//         return meeting;
//     }
// }

// const prisma = new ExtendedPrismaClient();
// export default prisma;
