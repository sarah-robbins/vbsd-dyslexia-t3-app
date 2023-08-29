import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/server/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const allMeetings = await prisma.meetingsData.findMany(); // Replace yourModelName with the name of your Prisma model

    res.json(allMeetings);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
