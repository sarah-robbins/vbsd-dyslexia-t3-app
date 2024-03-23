import { useState, useEffect } from "react";
import MeetingCalendar from "./MeetingCalendar/MeetingCalendar";
import MeetingForm from "./MeetingForm/MeetingForm";
import MeetingList from "./MeetingList/MeetingList";
import MeetingsTitleBar from "./MeetingsTitleBar/MeetingsTitleBar";
import dayjs, { type Dayjs } from "dayjs";
import { api } from "@/utils/api";
import {
  type Student,
  type Meeting,
  type MeetingAttendees,
  type MeetingWithAttendees,
} from "@/types";
import Students from "../Students/Students";
import { TRPCClientError } from "@trpc/client";
// import { useSession } from "next-auth/react";
// import StudentsInProgress from '../Students/Students-in-progress';

const Meetings = () => {
  // const { data: session } = useSession();
  // const sessionData = session?.user;
  // State
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeetings, setSelectedMeetings] = useState<
    MeetingWithAttendees[]
  >([]);
  const [selectedMeetingAttendees] = useState<MeetingAttendees[]>([]);
  // const [attendees, setAttendees] = useState<MeetingAttendees[]>([]);
  const [datedMeetingsWithAttendees, setDatedMeetingsWithAttendees] = useState<
    MeetingWithAttendees[]
  >([]);
  const [attendeesName] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isOnMeetingsPage] = useState<boolean>(true);

  function getFirstMonthInView() {
    const currentDate = dayjs();
    // Set to first day of previous month
    const firstDayOfMonth = currentDate.subtract(1, "month").startOf("month");
    return firstDayOfMonth;
  }

  const [viewDate, setViewDate] = useState(getFirstMonthInView());
  const [uniqueKey, setUniqueKey] = useState<number>(1); // add uniqueKey state

  // Database Calls
  // const getAllMeetings = api.meetings.getAllMeetings.useQuery(); // getAllMeetings

  const dateToQuery =
    selectedDate && dayjs.isDayjs(selectedDate) ? selectedDate : dayjs();

  // const { data: getDatedMeetings } = api.meetings.getMeetingsByDate.useQuery(
  //   dateToQuery.toDate()
  // ) as { data: MeetingWithAttendees[] };

  const getMeetingsByDate = api.meetings.getMeetingsByDate.useQuery(
    dateToQuery.toDate()
  ) as {
    data: MeetingWithAttendees[];
  };
  const getDatedMeetings = getMeetingsByDate.data;

  const { data: myStudents } = api.students.getStudentsForRole.useQuery() as {
    data: Student[];
  };

  useEffect(() => {
    if (myStudents) {
      setStudents(myStudents);
    }
  }, [myStudents]);

  // const { data: getMeetingsByTutorId } =
  //   api.meetings.getMeetingsByTutorId.useQuery({
  //     tutorId: sessionData?.userId ?? 0,
  //   });

  // const { data: getMeetingsBySchool } =
  //   api.meetings.getMeetingsBySchool.useQuery({
  //     school: sessionData?.school ?? '',
  //   });

  const convertMeetings = (meetings: Meeting[]): MeetingWithAttendees[] => {
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
        attendees: [], // Add the attendees property
      };
    });
  };

  const { data: roleBasedMeetings } =
    api.meetings.getMeetingsForRole.useQuery() as {
      data: Meeting[];
    };

  useEffect(() => {
    if (roleBasedMeetings) {
      console.log("roleBasedMeetings", roleBasedMeetings);
      // Convert dates to Dayjs objects and update state
      const convertedMeetings = convertMeetings(roleBasedMeetings);
      setMeetings(convertedMeetings);
    }
    setMeetings(getDatedMeetings);
  }, [getDatedMeetings, roleBasedMeetings]);

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
          students={students}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          isMeetingSelected={!!selectedMeetings}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          datedMeetingsWithAttendees={datedMeetingsWithAttendees}
          setDatedMeetingsWithAttendees={setDatedMeetingsWithAttendees}
          selectedMeetingAttendees={selectedMeetingAttendees}
          isOnMeetingsPage={isOnMeetingsPage}
          isOnStudentsPage={false}
        />
        <MeetingList
          meetings={meetings}
          students={students}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          datedMeetingsWithAttendees={datedMeetingsWithAttendees}
          attendeesName={attendeesName}
          isOnMeetingsPage={isOnMeetingsPage}
          isOnStudentsPage={false}
        />
      </div>
      {/* <StudentsInProgress /> */}
      <Students isOnMeetingsPage={isOnMeetingsPage} />
    </div>
  );
};

export default Meetings;
