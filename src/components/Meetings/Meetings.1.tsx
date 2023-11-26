import { useState, useEffect } from 'react';
import MeetingForm from './MeetingForm/MeetingForm';
import MeetingCalendar from './MeetingCalendar/MeetingCalendar';
import MeetingList from './MeetingList/MeetingList';
import MeetingsTitleBar from './MeetingsTitleBar/MeetingsTitleBar';
import dayjs, { type Dayjs } from 'dayjs';
import { api } from '@/utils/api';
import type {
  Student,
  Meeting,
  MeetingAttendees,
  MeetingWithAttendees,
} from '@/types';
import Students from '../Students/Students';

export const Meetings = () => {
  // State
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeetings, setSelectedMeetings] = useState<
    MeetingWithAttendees[]
  >([]);

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

  const { data: getStudentsBySchool } =
    api.students.getStudentsBySchool.useQuery('King') as {
      data: Student[];
    };

  // const { data: getStudentsByTutor } =
  //   api.students.getStudentsByTutor.useQuery('John Doe') as {
  //     data: Meetings[];
  //   };
  // const { data: getStudentsForTutor } =
  //   api.students.getStudentsForTutor.useQuery({tutor: 'John Doe', school: 'King'}) as {
  //     data: Meetings[];
  //   }
  // const getAllAttendees = api.attendees.getAllAttendees.useQuery();
  const meetingId = meetings[0]?.id || 0;
  const { data: getAttendeesByMeeting } =
    api.attendees.getAttendeesByMeeting.useQuery(meetingId) as {
      data: MeetingAttendees[];
    };

  const [attendees, setAttendees] = useState<MeetingAttendees[]>([]);
  useEffect(() => {
    setAttendees(getAttendeesByMeeting);
  }, [getAttendeesByMeeting]);

  // const studentIds = getAllAttendees.data
  //   .filter((a) => a.meeting_id === meetingId)
  //   .map((a) => a.student_id);
  // const studentId = 102;
  const studentId = meetings[0]?.id || 0;
  const { data: students } = api.students.getStudentById.useQuery(
    studentId
  ) as {
    data: Student[];
  };

  // const { data: getAttendeesByStudent } =
  //   api.attendees.getAttendeesByStudent.useQuery(studentId) as {
  //     data: MeetingWithAttendees[];
  //   };

  useEffect(() => {
    if (getAllMeetings.isSuccess) {
      const convertedData: MeetingWithAttendees[] = getAllMeetings.data.map(
        (meeting): MeetingWithAttendees => {
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
            attendees:
              meeting.MeetingAttendees?.map((attendee: MeetingAttendees) => ({
                // Map each attendee to the expected shape
                id: attendee.id,
                created_at: attendee.created_at,
                meeting_status: attendee.meeting_status,
                student_id: attendee.student_id,
                meeting_id: attendee.meeting_id,
                name: attendee.name,
              })) ?? [],
          };
        }
      );
      setMeetings(convertedData);
    }
  }, [getAllMeetings.data, getAllMeetings.isSuccess]);

  useEffect(() => {
    setSelectedDate(selectedDate);
  }, [selectedDate]);

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
        />
        <MeetingList
          meetings={meetings}
          getStudentsBySchool={getStudentsBySchool}
          selectedDate={selectedDate}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          getAttendeesByMeeting={getAttendeesByMeeting}
          {...attendees}
        />
      </div>
      <Students />
    </div>
  );
};
