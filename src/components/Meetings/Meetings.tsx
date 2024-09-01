import { useState, useEffect } from "react";
import MeetingCalendar from "./MeetingCalendar/MeetingCalendar";
import MeetingForm from "./MeetingForm/MeetingForm";
import MeetingList from "./MeetingList/MeetingList";
import MeetingsTitleBar from "./MeetingsTitleBar/MeetingsTitleBar";
import dayjs, { type Dayjs } from "dayjs";
import { api } from "@/utils/api";
import {
  type Student,
  type MeetingWithAttendees,
} from "@/types";
import Students from "../Students/Students";
// import { useSession } from "next-auth/react";

// Initialization
const Meetings = () => {
  // const { data: session } = useSession();
  // const sessionData = session?.user;

  // State Management
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [allMeetings, setAllMeetings] = useState<MeetingWithAttendees[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeetings, setSelectedMeetings] = useState<MeetingWithAttendees[]>([]);
  const [datedMeetingsWithAttendees, setDatedMeetingsWithAttendees] = useState<MeetingWithAttendees[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isOnMeetingsPage] = useState<boolean>(true);
  const [myDatedMeetings, setMyDatedMeetings] = useState<MeetingWithAttendees[]>([]);

  function getFirstMonthInView() {
    const currentDate = dayjs();
    const firstDayOfMonth = currentDate.subtract(1, "month").startOf("month");
    return firstDayOfMonth;
  }

  const [viewDate, setViewDate] = useState(getFirstMonthInView());
  const [uniqueKey, setUniqueKey] = useState<number>(1);

  const dateToQuery = selectedDate && dayjs.isDayjs(selectedDate) ? selectedDate : dayjs();

  // API Calls
  const { data: getAllMeetings } = api.meetings.getAllMeetings.useQuery();

  const getMeetingsByDate = api.meetings.getMeetingsByRoleAndDate.useQuery(dateToQuery.toDate()) as {
    data: MeetingWithAttendees[];
  };
  const getDatedMeetings = getMeetingsByDate.data;

  const { data: myStudents } = api.students.getStudentsForRole.useQuery() as {
    data: Student[];
  };

  // Update State based on API calls
  useEffect(() => {
    if (getDatedMeetings) {
      setMyDatedMeetings(getDatedMeetings);
    }
    if (myStudents) {
      setStudents(myStudents);
    }
  }, [getDatedMeetings, myStudents]);

  useEffect(() => {
    if (getAllMeetings) {
      const formattedMeetings = getAllMeetings.map(meeting => ({
        ...meeting,
        MeetingAttendees: meeting.MeetingAttendees.map(attendee => ({
          ...attendee,
          name: attendee.name || undefined,
        })),
      }));
      setAllMeetings(formattedMeetings);
    }
    console.log(allMeetings);
  }, [getAllMeetings]);

  // Render Components
  return (
    <div className="flex flex-column justify-content-center gap-4">
      <div className="flex gap-4 align-items-center justify-content-between w-full">
      <MeetingsTitleBar
        setDate={setDate}
        setViewDate={setViewDate}
        setUniqueKey={setUniqueKey}
      />
      </div>
      <div className="flex">
      <MeetingCalendar
        allMeetings={allMeetings}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        uniqueKey={uniqueKey}
        viewDate={viewDate}
      />
      </div>
      <div className="flex flex-column lg:flex-row gap-4">
        <MeetingForm
          meetings={meetings}
          setAllMeetings={setAllMeetings}
          setMeetings={setMeetings}
          students={students}
          myDatedMeetings={myDatedMeetings}
          setMyDatedMeetings={setMyDatedMeetings}
          selectedMeetings={selectedMeetings}
          setSelectedMeetings={setSelectedMeetings}
          selectedMeetingAttendees={[]}
          datedMeetingsWithAttendees={datedMeetingsWithAttendees}
          selectedDate={selectedDate}
          setDatedMeetingsWithAttendees={setDatedMeetingsWithAttendees}
          isOnMeetingsPage={isOnMeetingsPage}
          isOnStudentsPage={false}
        />
        <MeetingList
          meetings={meetings}
          // setMeetings={setMeetings}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          // getDatedMeetings={getDatedMeetings}
          selectedMeetings={selectedMeetings}
          students={students}
          setSelectedMeetings={setSelectedMeetings}
          datedMeetingsWithAttendees={datedMeetingsWithAttendees}
          isOnMeetingsPage={isOnMeetingsPage}
          isOnStudentsPage={false}
          />
        </div>
      <Students isOnMeetingsPage={isOnMeetingsPage} />
    </div>
  );
};

export default Meetings;
