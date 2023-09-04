import { useState, useEffect } from 'react';
import MeetingForm from './MeetingForm/MeetingForm';
import MeetingCalendar from './MeetingCalendar/MeetingCalendar';
import MeetingList from './MeetingList/MeetingList';
import MeetingsTitleBar from './MeetingsTitleBar/MeetingsTitleBar';
import dayjs, { type Dayjs } from 'dayjs';
import { api } from '@/utils/api';

import { type dummyStudents, type dummyMeetings } from '@prisma/client';
import Students from '../Students/Students';

interface Meeting {
  id?: number;
  name: string;
  student_id?: number;
  start?: Dayjs;
  end?: Dayjs;
  meeting_status: string;
  program?: string;
  level_lesson?: string;
  meeting_notes?: string;
  recorded_by: string;
  recorded_on: Dayjs;
  edited_by?: string;
  edited_on?: Dayjs;
}

const Meetings = () => {
  // State
  const [meetings, setMeetings] = useState<dummyMeetings[]>([]);
  const [date] = useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null | string>();
  const [selectedMeetings, setSelectedMeetings] = useState<Meeting[]>([]);

  // Database Calls
  const getAllMeetings = api.meetings.getAllMeetings.useQuery(); // getAllMeetings
  const { data: getDatedMeetings } = api.meetings.getMeetingsByDate.useQuery(
    selectedDate as string
  ) as { data: Meeting[] }; //getMeetingsByDate
  console.log('selectedDates from Meetings.tsx', selectedDate);
  const { data: getStudentsBySchool } =
    api.students.getStudentsBySchool.useQuery('King') as {
      data: dummyStudents[];
    }; // getStudentsBySchool

  // const { data: getStudentsByTutor } =
  //   api.students.getStudentsByTutor.useQuery('John Doe') as {
  //     data: dummyMeetings[];
  //   }; // getStudentsByTutor

  // const { data: getStudentsForTutor } =
  //   api.students.getStudentsForTutor.useQuery({tutor: 'John Doe', school: 'King'}) as {
  //     data: dummyMeetings[];
  //   }; // getStudentsForTutor

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
