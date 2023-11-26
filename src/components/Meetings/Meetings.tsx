import { useState, useEffect } from 'react';
import MeetingForm from './MeetingForm/MeetingForm';
import MeetingCalendar from './MeetingCalendar/MeetingCalendar';
import MeetingList from './MeetingList/MeetingList';
import MeetingsTitleBar from './MeetingsTitleBar/MeetingsTitleBar';
import dayjs, { type Dayjs } from 'dayjs';
import { api } from '@/utils/api';
import {
  type Student,
  type Meeting,
  type MeetingAttendees,
  type MeetingWithAttendees,
} from '@/types';
import Students from '../Students/Students';
import { useSession } from 'next-auth/react';
// import StudentsInProgress from '../Students/Students-in-progress';

const Meetings = () => {
  const { data: session } = useSession();
  const sessionData = session?.user;
  // State
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeetings, setSelectedMeetings] = useState<
    MeetingWithAttendees[]
  >([]);
  const [selectedMeetingAttendees, setSelectedMeetingAttendees] = useState<
    MeetingAttendees[]
  >([]);
  // const [attendees, setAttendees] = useState<MeetingAttendees[]>([]);
  const [datedMeetingsWithAttendees, setDatedMeetingsWithAttendees] = useState<
    MeetingWithAttendees[]
  >([]);
  const [attendeesName, setAttendeesName] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  function getFirstMonthInView() {
    const currentDate = dayjs();
    // Set to first day of previous month
    const firstDayOfMonth = currentDate.subtract(1, 'month').startOf('month');
    return firstDayOfMonth;
  }

  const [viewDate, setViewDate] = useState(getFirstMonthInView());
  const [uniqueKey, setUniqueKey] = useState<number>(1); // add uniqueKey state

  // Database Calls
  const getAllMeetings = api.meetings.getAllMeetings.useQuery(); // getAllMeetings

  const dateToQuery =
    selectedDate && dayjs.isDayjs(selectedDate) ? selectedDate : dayjs();

  const { data: getDatedMeetings } = api.meetings.getMeetingsByDate.useQuery(
    dateToQuery.toDate()
  ) as { data: MeetingWithAttendees[] };

  /* -------------------------------------------------------------------------- */
  /* --- TODO: insert function to assign students depending on session role --- */
  /* -------------------------------------------------------------------------- */

  // Students by tutor doesn't exist yet. I need to update the session to store the users.id as userId in the User table. Then I can use that to query the Tutor table to get the tutor_id. Then I can use that to query the Students table to get the students for that tutor.
  const { data: getStudentsForTutor } =
    api.students.getStudentsForTutor.useQuery(sessionData?.userId ?? 0) as {
      data: Student[];
    };
  const { data: getStudentsBySchool } =
    api.students.getStudentsBySchool.useQuery(sessionData?.school ?? '') as {
      data: Student[];
    };
  useEffect(() => {
    if (sessionData?.role === 'tutor' && getStudentsForTutor) {
      setStudents(getStudentsForTutor);
    } else if (sessionData?.role === 'principal' && getStudentsBySchool) {
      setStudents(getStudentsBySchool);
    }
  }, [sessionData, getStudentsForTutor, getStudentsBySchool]);

  const { data: getMeetingsByTutorId } =
    api.meetings.getMeetingsByTutorId.useQuery({
      tutorId: sessionData?.userId ?? 0,
    });

  const { data: getMeetingsBySchool } =
    api.meetings.getMeetingsBySchool.useQuery({
      school: sessionData?.school ?? '',
    });

  const convertMeetings = (
    meetings: MeetingWithAttendees[]
  ): MeetingWithAttendees[] => {
    return meetings.map((meeting) => {
      let start, end, edited_on, recorded_on;

      if (meeting.start && meeting.start instanceof Date) {
        start = dayjs(meeting.start);
      } else {
        start = meeting.start;
      }

      if (meeting.end && meeting.end instanceof Date) {
        end = dayjs(meeting.end);
      } else {
        end = meeting.end;
      }

      if (meeting.edited_on && meeting.edited_on instanceof Date) {
        edited_on = dayjs(meeting.edited_on);
      } else {
        edited_on = meeting.edited_on;
      }

      if (meeting.recorded_on && meeting.recorded_on instanceof Date) {
        recorded_on = dayjs(meeting.recorded_on);
      } else {
        recorded_on = meeting.recorded_on;
      }

      return {
        ...meeting,
        start,
        end,
        edited_on,
        recorded_on,
        attendees: [],
      };
    });
  };

  useEffect(() => {
    if (getMeetingsBySchool && sessionData?.role === 'principal') {
      const convertedData = convertMeetings(
        getMeetingsBySchool as unknown as MeetingWithAttendees[]
      );
      setMeetings(convertedData);
    }
    if (getMeetingsByTutorId && sessionData?.role === 'tutor') {
      const convertedData = convertMeetings(
        getMeetingsByTutorId as unknown as MeetingWithAttendees[]
      );
      setMeetings(convertedData);
    }
  }, [
    getAllMeetings.data,
    getAllMeetings.isSuccess,
    getMeetingsBySchool,
    getMeetingsByTutorId,
    sessionData?.role,
  ]);

  return (
    <div className="flex flex-column justify-content-center gap-4">
      <div className="flex gap-4 align-items-center justify-content-between w-full">
        <MeetingsTitleBar
          setSelectedDate={setSelectedDate}
          setDate={setDate}
          setViewDate={setViewDate}
          setUniqueKey={setUniqueKey}
        />
      </div>
      <div className="flex">
        <MeetingCalendar
          date={date}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          meetings={meetings}
          viewDate={viewDate}
          setDate={setDate}
          uniqueKey={uniqueKey}
        />
      </div>
      <div className="flex flex-column lg:flex-row gap-4">
        <MeetingForm
          meetings={meetings}
          setMeetings={setMeetings}
          getStudentsBySchool={getStudentsBySchool}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          isMeetingSelected={!!selectedMeetings}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setDatedMeetingsWithAttendees={setDatedMeetingsWithAttendees}
          selectedMeetingAttendees={selectedMeetingAttendees}
          // attendees={attendees}
        />
        <MeetingList
          meetings={meetings}
          getStudentsBySchool={getStudentsBySchool}
          selectedDate={selectedDate}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          datedMeetingsWithAttendees={datedMeetingsWithAttendees}
          attendeesName={attendeesName}
        />
      </div>
      {/* <StudentsInProgress /> */}
      <Students />
    </div>
  );
};

export default Meetings;
