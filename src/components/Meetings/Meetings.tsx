// @ts-nocheck

import { useState, useEffect } from 'react';
import MeetingForm from './MeetingForm/MeetingForm';
import MeetingCalendar from './MeetingCalendar/MeetingCalendar';
import MeetingDataTable from './MeetingDataTable/MeetingDataTable';
import MeetingList from './MeetingList/MeetingList';
import MeetingsTitleBar from './MeetingsTitleBar/MeetingsTitleBar';
import dayjs, { type Dayjs } from 'dayjs';
import { api } from '@/utils/api';

import { type dummyMeetings } from '@prisma/client';
import Students from '../Students/Students';

const Meetings = () => {
  // State
  const [meetings, setMeetings] = useState<dummyMeetings[]>([]);
  const [date, setDate] = useState<string | Date | Date[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMeetings, setSelectedMeetings] = useState<dummyMeetings[]>([]);

  // Database Calls
  const getAllMeetings = api.meetings.getAllMeetings.useQuery(); // getAllMeetings
  const { data: getDatedMeetings } =
    api.meetings.getMeetingsByDate.useQuery(selectedDate); //getMeetingsByDate
  const { data: getStudentsBySchool } =
    api.students.getStudentsBySchool.useQuery('King'); // getStudentsByRole

  useEffect(() => {
    if (getAllMeetings.isSuccess) {
      setMeetings(getAllMeetings.data);
    }
  }, [getAllMeetings.data, getAllMeetings.isSuccess]);

  return (
    <div className="flex flex-column justify-content-center gap-4">
      <div className="flex gap-4 align-items-center justify-content-between w-full">
        <MeetingsTitleBar setSelectedDate={setSelectedDate} />
      </div>
      <div className="flex">
        <MeetingCalendar
          date={date}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          meetings={meetings}
        />
      </div>
      <div className="flex flex-column lg:flex-row gap-4">
        <MeetingForm
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          meetings={meetings}
          setMeetings={setMeetings}
          getStudentsBySchool={getStudentsBySchool}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          isMeetingSelected={!!selectedMeetings}
        />
        <MeetingList
          meetings={meetings}
          selectedDate={selectedDate}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
        />
      </div>
      <Students />
    </div>
  );
};

export default Meetings;
