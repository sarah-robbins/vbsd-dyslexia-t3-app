import { useState, useEffect } from "react";
import MeetingCalendar from "./MeetingCalendar/MeetingCalendar";
import MeetingForm from "./MeetingForm/MeetingForm";
import MeetingList from "./MeetingList/MeetingList";
import MeetingsTitleBar from "./MeetingsTitleBar/MeetingsTitleBar";
import dayjs, { type Dayjs } from "dayjs";
import { api } from "@/utils/api";
import {
  type Student,
  type MeetingAttendees,
  type MeetingWithAttendees,
} from "@/types";
import Students from "../Students/Students";
import { useSession } from "next-auth/react";

const Meetings = () => {
  const { data: session } = useSession();
  const sessionData = session?.user;
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeetings, setSelectedMeetings] = useState<
    MeetingWithAttendees[]
  >([]);
  const [selectedMeetingAttendees] = useState<MeetingAttendees[]>([]);
  const [datedMeetingsWithAttendees, setDatedMeetingsWithAttendees] = useState<
    MeetingWithAttendees[]
  >([]);
  const [attendeesName] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isOnMeetingsPage] = useState<boolean>(true);

  function getFirstMonthInView() {
    const currentDate = dayjs();
    const firstDayOfMonth = currentDate.subtract(1, "month").startOf("month");
    return firstDayOfMonth;
  }

  const [viewDate, setViewDate] = useState(getFirstMonthInView());
  const [uniqueKey, setUniqueKey] = useState<number>(1);

  const dateToQuery =
    selectedDate && dayjs.isDayjs(selectedDate) ? selectedDate : dayjs();

  const getMeetingsByDate = api.meetings.getMeetingsByRoleAndDate.useQuery(
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

  const { data: getMeetingsByTutorId } =
    api.meetings.getMeetingsByTutorId.useQuery({
      tutorId: sessionData?.userId ?? 0,
    });
  const tutorMeetings = getMeetingsByTutorId;

  useEffect(() => {
    if (tutorMeetings) {
      const transformedMeetings = tutorMeetings.map((meeting) => ({
        ...meeting,
        MeetingAttendees: meeting.MeetingAttendees.map((attendee) => ({
          ...attendee,
          name: attendee.name === null ? undefined : attendee.name,
        })),
      }));
      setMeetings(transformedMeetings);
    }
  }, [tutorMeetings]);

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
      <Students isOnMeetingsPage={isOnMeetingsPage} />
    </div>
  );
};

export default Meetings;
