import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import dayjs, { type Dayjs } from "dayjs";
import { type Meeting, type Student, type MeetingWithAttendees } from "@/types";
import { LocalizationProvider, DatePicker, type PickersDayProps, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'
import { styled } from "@mui/material/styles";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isBetween)

const DB_TIMEZONE = 'America/Chicago';
const APP_TIMEZONE = dayjs.tz.guess();

const MEETING_STATUSES = {
  MET: "Met",
  STUDENT_ABSENT: "Student Absent",
  TUTOR_ABSENT: "Tutor Absent",
  STUDENT_UNAVAILABLE: "Student Unavailable",
  TUTOR_UNAVAILABLE: "Tutor Unavailable",
};

const STATUS_COLORS = {
  [MEETING_STATUSES.MET]: "primary",
  [MEETING_STATUSES.STUDENT_ABSENT]: "secondary",
  [MEETING_STATUSES.TUTOR_ABSENT]: "secondary",
  [MEETING_STATUSES.STUDENT_UNAVAILABLE]: "secondary",
  [MEETING_STATUSES.TUTOR_UNAVAILABLE]: "secondary",
};

// Custom hook for filtering meetings
const useFilteredMeetings = (
  meetings: MeetingWithAttendees[],
  selectedDate: Dayjs,
  isOnMeetingsPage: boolean,
  isOnStudentsPage: boolean,
  students: Student[],
  studentId?: number  // Add this parameter
) => {
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingWithAttendees[]>([]);

  useEffect(() => {
    if (selectedDate) {
      let filtered: MeetingWithAttendees[] = [];
      if (isOnMeetingsPage || isOnStudentsPage) {
        const startOfDay = selectedDate.tz(DB_TIMEZONE).startOf('day');
        const endOfDay = selectedDate.tz(DB_TIMEZONE).endOf('day');

        filtered = meetings.filter((meeting) => {
          const meetingStart = dayjs.utc(meeting.start).tz(DB_TIMEZONE);
          return meetingStart.isBetween(startOfDay, endOfDay, null, '[]');
        });

        if (isOnMeetingsPage) {
          filtered = filtered.map((meeting) => ({
            ...meeting,
            dateString: dayjs.utc(meeting.start).tz(DB_TIMEZONE).format("YYYY-MM-DD"),
          }));
        }
        if (isOnStudentsPage) {
          const datedMeetingsWithAttendees = filtered.map((meeting): MeetingWithAttendees => {
            const attendees = (meeting.MeetingAttendees ?? [])
              .map((attendee) => {
                const student = students?.find((s) => s.id === attendee.student_id);
                if (!student) return null;
                return {
                  ...attendee,
                  id: attendee.student_id,
                  name: `${student.first_name ?? ""} ${student.last_name ?? ""}`,
                };
              })
              .filter((a): a is { id: number; meeting_id: number; student_id: number; meeting_status: string; created_at: Dayjs; name: string; } => Boolean(a));
            return { ...meeting, attendees };
          });
          filtered = datedMeetingsWithAttendees.map((meeting) => ({
            ...meeting,
            dateString: dayjs(meeting.start).format("YYYY-MM-DD"),
          }));

          // Add this block here
          if (studentId) {
            filtered = filtered.filter(meeting => 
              meeting.attendees?.some(attendee => attendee.student_id === studentId)
            );
          }
        }
      }
      setFilteredMeetings(filtered);
    }
  }, [meetings, selectedDate, isOnMeetingsPage, isOnStudentsPage, students, studentId]);
  return filteredMeetings;
};

// Extracted smaller components
const MeetingStatusChip: React.FC<{ status: string }> = React.memo(({ status }) => (
  <Chip
    color={(STATUS_COLORS[status] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning") || "default"}
    label={status || "Unknown Status"}
    className="meeting-status-chips"
  />
));

MeetingStatusChip.displayName = "MeetingStatusChip";

const MeetingTime: React.FC<{ start: Date; end: Date }> = React.memo(({ start, end }) => {
  const formatTime = (time: Date): string => {
    return dayjs.utc(time).tz(APP_TIMEZONE).format("h:mm A");
  };

  const startTime = formatTime(start);
  const endTime = formatTime(end);
  const timeSpan = `${startTime} - ${endTime}`;

  return (
    <div className="flex align-items-center gap-2">
      <span>{timeSpan}</span>
    </div>
  );
});

MeetingTime.displayName = "MeetingTime";

interface CustomPickersDayProps extends PickersDayProps<Dayjs> {
  hasMeeting?: boolean;
}

interface Props {
  meetings: MeetingWithAttendees[];
  // setMeetings: (meetings: MeetingWithAttendees[]) => void;
  students: Student[];
  studentId: number;
  selectedDate: Dayjs;
  // meetings: MeetingWithAttendees[];
  selectedMeetings: MeetingWithAttendees[];
  setSelectedDate: (date: Dayjs) => void;
  setSelectedMeetings: (meetings: MeetingWithAttendees[]) => void;
  datedMeetingsWithAttendees: MeetingWithAttendees[];
  // attendeesName: string[];
  isOnMeetingsPage: boolean;
  isOnStudentsPage: boolean;
}

const MeetingList: React.FC<Props> = ({
  meetings = [],
  selectedDate,
  setSelectedDate,
  selectedMeetings = [],
  students = [],
  studentId,
  setSelectedMeetings,
  datedMeetingsWithAttendees = [],
  isOnMeetingsPage,
  isOnStudentsPage,
}) => {
  const hiddenOnMeetingPage = isOnMeetingsPage ? "hidden" : "";
  const showOnStudentsPage = isOnStudentsPage ? "" : "hidden";
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const [formDate, setFormDate] = useState(selectedDate);

  const filteredMeetings = useFilteredMeetings(datedMeetingsWithAttendees, selectedDate, isOnMeetingsPage, isOnStudentsPage, students, studentId);

  const handleFormDateChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setFormDate(date);
      if (isOnMeetingsPage){
        setSelectedDate(date);
      }
      if (isOnStudentsPage){
        setSelectedDate(date);
      }
    }
  }, [isOnMeetingsPage, isOnStudentsPage, setSelectedDate]);


  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedMeetings.length > 0 &&
        selectedMeetings.length < filteredMeetings.length;
    }
  }, [selectedMeetings, filteredMeetings]);

  const calculateMeetingTotal = useCallback((start: string): number => {
    const startDate = dayjs(start);
    const startDay = startDate.date();
    const startMonth = startDate.month();
    const startYear = startDate.year();

    return meetings.reduce((total, meeting) => {
      const meetingDate = dayjs(meeting.start);
      if (
        meetingDate.date() === startDay &&
        meetingDate.month() === startMonth &&
        meetingDate.year() === startYear
      ) {
        return total + 1;
      }
      return total;
    }, 0);
  }, [meetings]);

  const headerTemplate = useCallback((data: Meeting) => {
    const originalDate = dayjs(data.start);
    const newDate = originalDate.startOf("day").toDate();

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const getOrdinalSuffix = (day: number) => {
      if (day >= 11 && day <= 13) return "th";
      const lastDigit = day % 10;
      switch (lastDigit) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const formattedDate = formatter.format(newDate);
    const dayOfMonth = newDate.getDate();
    const ordinalSuffix = getOrdinalSuffix(dayOfMonth);

    const finalFormattedDate = formattedDate.replace(
      new RegExp(`\\b${dayOfMonth}\\b`),
      `${dayOfMonth}${ordinalSuffix}`
    );

    return (
      <div className="flex justify-content-between">
        <div className="flex align-items-center gap-2">
          <span className="font-bold">{finalFormattedDate}</span>
        </div>
        <div className="flex justify-content-end font-bold w-full">
          Total Meetings: {calculateMeetingTotal(data.start?.toString() ?? "")}
        </div>
      </div>
    );
  }, [calculateMeetingTotal]);

  const footerTemplate = useCallback(() => <td colSpan={5} className="h-auto" />, []);

  const statusBodyTemplate = useCallback((rowData: MeetingWithAttendees) => {
    if (!rowData.attendees || rowData.attendees.length === 0) {
      return <span>No Attendees</span>;
    }

    return rowData.attendees.map((attendee) => (
      <React.Fragment key={attendee.id}>
        <MeetingStatusChip status={attendee.meeting_status ?? ""} />
        <br />
      </React.Fragment>
    ));
  }, []);

  const getName = useCallback((rowData: MeetingWithAttendees) => {
    if (!datedMeetingsWithAttendees || !rowData) {
      return <div>Loading...</div>;
    }
    if (!rowData.attendees || rowData.attendees.length === 0) {
      return <div>No Attendees</div>;
    }
    
    return rowData.attendees?.map((attendee) => (
      <div className="meeting-attendee-name" key={attendee.id}>
        {attendee.name}
      </div>
    ));
  }, [datedMeetingsWithAttendees]);

  const toggleAllCheckboxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      setSelectedMeetings([]);
    }
    // Do nothing if trying to check all
  }, [setSelectedMeetings]);

  const isCheckboxChecked = useCallback((meeting: MeetingWithAttendees) => {
    return selectedMeetings.some((selectedMeeting) => selectedMeeting.id === meeting.id);
  }, [selectedMeetings]);

  const toggleCheckbox = useCallback((meeting: MeetingWithAttendees) => {
    if (isCheckboxChecked(meeting)) {
      setSelectedMeetings(selectedMeetings.filter((m) => m.id !== meeting.id));
    } else {
      setSelectedMeetings([meeting]);
    }
  }, [isCheckboxChecked, selectedMeetings, setSelectedMeetings]);

  useEffect(() => {
    setSelectedMeetings([]);
  }, [selectedDate, setSelectedMeetings]);

  const meetingDates = useMemo(() => {
    return datedMeetingsWithAttendees.reduce((acc, meeting) => {
      const date = dayjs(meeting.start).format('YYYY-MM-DD');
      if (meeting.attendees?.some(attendee => attendee.student_id === studentId)) {
        acc.add(date);
      }
      return acc;
    }, new Set<string>());
  }, [datedMeetingsWithAttendees, studentId]);
  
  const hasMeetingOnDate = useCallback((date: Dayjs) => {
    return meetingDates.has(date.format('YYYY-MM-DD'));
  }, [meetingDates]);

  const CustomPickersDay = useMemo(() => styled(
    ({ hasMeeting: _hasMeeting, ...otherProps }: CustomPickersDayProps) => (
      <PickersDay {...otherProps} />
    )
  )(({ theme, hasMeeting }) => ({
    ...(hasMeeting && {
      borderRadius: '50%',
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.text.primary,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.grey[300],
      },
    }),
  })), []);

  const ServerDay = useCallback((props: PickersDayProps<Dayjs>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const hasMeeting = hasMeetingOnDate(day);

    return (
      <CustomPickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        hasMeeting={hasMeeting}
      />
    );
  }, [CustomPickersDay, hasMeetingOnDate]);

  const datePicker = useMemo(() => (
    <div className={`selectDate ${hiddenOnMeetingPage} ${showOnStudentsPage}`}>
      <span>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            className="w-12"
            value={formDate}
            onChange={handleFormDateChange}
            slots={{
              day: ServerDay
            }}
          />
        </LocalizationProvider>
      </span>
    </div>
  ), [formDate, handleFormDateChange, hiddenOnMeetingPage, showOnStudentsPage, ServerDay]);  
  
  // const datePicker = useMemo(() => (
  //   <div className={`selectDate ${hiddenOnMeetingPage} ${showOnStudentsPage}`}>
  //     <span>
  //       <LocalizationProvider dateAdapter={AdapterDayjs}>
  //         <DatePicker
  //           label="Date"
  //           className="w-12"
  //           value={formDate}
  //           onChange={handleFormDateChange}
  //           slots={{
  //             day: ServerDay
  //           }}
  //         />
  //       </LocalizationProvider>
  //     </span>
  //   </div>
  // ), [formDate, handleFormDateChange, hiddenOnMeetingPage, showOnStudentsPage]);

  return (
    <Card className="lg:w-7 flex-order-1 lg:flex-order-2 elevate-item">
      <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
        <h3>Meetings</h3>
      </div>
      {datePicker}
      <DataTable
        value={filteredMeetings}
        emptyMessage="No meetings on this day."
        rowGroupMode="subheader"
        groupRowsBy="dateString"
        sortMode="single"
        sortField="start"
        sortOrder={1}
        scrollable
        scrollHeight="510px"
        rowGroupHeaderTemplate={headerTemplate}
        rowGroupFooterTemplate={footerTemplate}
        dataKey="id"
        stripedRows
        tableStyle={{ minWidth: "20rem" }}
        rowClassName={(rowData: MeetingWithAttendees) =>
          isCheckboxChecked(rowData) ? "row-selected" : ""
        }
      >
        <Column
          header={() => (
            <Checkbox
              indeterminate={
                selectedMeetings.length > 0 &&
                selectedMeetings.length < filteredMeetings.length
              }
              checked={selectedMeetings.length > 0}
              onChange={toggleAllCheckboxes}
            />
          )}
          body={(rowData: MeetingWithAttendees) => (
            <Checkbox
              checked={isCheckboxChecked(rowData)}
              onChange={() => toggleCheckbox(rowData)}
            />
          )}
          style={{ width: "3rem" }}
          headerStyle={{ width: "3rem" }}
        />
        <Column
          field="time"
          header="Time"
          body={(rowData: Meeting) => <MeetingTime start={dayjs(rowData.start).toDate()} end={dayjs(rowData.end).toDate()} />}
          style={{ minWidth: "170px", maxWidth: "calc(170px + 1.5rem)" }}
          sortable
        />
        <Column
          body={getName}
          header="Name"
          style={{ minWidth: "150px" }}
          sortable
        />
        <Column
          field="meeting_status"
          header="Meeting Status"
          body={statusBodyTemplate}
          style={{ minWidth: "130px", maxWidth: "180px" }}
          className="meeting-status"
          sortable
        />
      </DataTable>
    </Card>
  );
};

export default React.memo(MeetingList);