import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import dayjs, { type Dayjs } from 'dayjs';
import { type Meeting, type Student, type MeetingWithAttendees } from '@/types';

interface Props {
  selectedDate: Dayjs;
  getDatedMeetings: MeetingWithAttendees[];
  meetings: MeetingWithAttendees[];
  students: Student[];
  selectedMeetings: MeetingWithAttendees[];
  setSelectedMeetings: (meetings: MeetingWithAttendees[]) => void;
  datedMeetingsWithAttendees: MeetingWithAttendees[];
  attendeesName: string[];
}

const MeetingList: React.FC<Props> = ({
  selectedDate,
  getDatedMeetings = [],
  selectedMeetings = [],
  meetings = [],
  // students = [],
  setSelectedMeetings = () => {
    meetings;
  },
  datedMeetingsWithAttendees = [],
}) => {
  const [filteredMeetings, setFilteredMeetings] = useState<
    MeetingWithAttendees[]
  >([]);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectedDate) {
      const filtered = datedMeetingsWithAttendees
        .map((meeting) => ({
          ...meeting,
          dateString: dayjs(meeting.start).format('YYYY-MM-DD'),
        }))
        .filter((meeting) => {
          const meetingDate = dayjs(meeting.start);
          return meetingDate.isSame(selectedDate, 'day');
        });
      setFilteredMeetings(filtered);
    }
  }, [datedMeetingsWithAttendees, getDatedMeetings, selectedDate]);

  useEffect(() => {
    // Update the indeterminate state of the "Check All" checkbox
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedMeetings.length > 0 &&
        selectedMeetings.length < filteredMeetings.length;
    }
  }, [selectedMeetings, filteredMeetings]);

  const headerTemplate = (data: Meeting) => {
    const originalDate = dayjs(data.start);
    const newDate = originalDate.startOf('day').toDate();

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const getOrdinalSuffix = (day: number) => {
      if (day >= 11 && day <= 13) {
        return 'th';
      }
      const lastDigit = day % 10;
      switch (lastDigit) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(newDate);
    const dayOfMonth = newDate.getDate();
    const ordinalSuffix = getOrdinalSuffix(dayOfMonth);

    const finalFormattedDate = formattedDate.replace(
      new RegExp(`\\b${dayOfMonth}\\b`),
      `${dayOfMonth}${ordinalSuffix}`
    );

    return (
      <React.Fragment>
        <div className="flex justify-content-between">
          <div className="flex align-items-center gap-2">
            <span className="font-bold">{finalFormattedDate}</span>
          </div>
          <div>
            <div className="flex justify-content-end font-bold w-full">
              Total Meetings:{' '}
              {calculateMeetingTotal(data.start?.toString() ?? '')}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const footerTemplate = () => {
    return <td colSpan={5} className="h-auto"></td>;
  };

  const statusBodyTemplate = (rowData: MeetingWithAttendees) => {
    // Check if attendees are present
    if (!rowData.attendees || rowData.attendees.length === 0) {
      return <span>No Attendees</span>; // Or handle this case as appropriate
    }

    // Map each attendee to a Chip with their status
    return rowData.attendees.map((attendee, index) => (
      <React.Fragment key={attendee.id}>
        {' '}
        <Chip
          key={index}
          color={getStatusColorForTable(attendee.meeting_status ?? '')}
          label={attendee.meeting_status ?? 'Unknown Status'}
          className="meeting-status-chips"
        />
        <br />
      </React.Fragment>
    ));
  };

  const formatMeetingTime = (data: Meeting) => {
    const { start, end } = data;

    const formatTime = (time: Date | Dayjs | null): string => {
      const date = dayjs(time ? time.toISOString() : undefined);
      const hours = date.hour();
      const minutes = date.minute();

      const isPM = hours >= 12;
      const formattedHours = isPM ? hours % 12 || 12 : hours;
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const period = isPM ? 'pm' : 'am';

      return `${formattedHours}:${formattedMinutes}${period}`;
    };

    const startTime = formatTime(start);
    const endTime = formatTime(end);
    const timeSpan = `${startTime} - ${endTime}`;

    return (
      <div className="flex align-items-center gap-2">
        <span>{timeSpan}</span>
      </div>
    );
  };
  // calculate the total amount of meetings on a given day in the meeting list
  const calculateMeetingTotal = (start: string): number => {
    let total = 0;

    // Convert start string to a dayjs object
    const startDate = dayjs(start);

    // Extract day, month, and year from start
    const startDay = startDate.date();
    const startMonth = startDate.month();
    const startYear = startDate.year();

    if (getDatedMeetings) {
      for (const meeting of getDatedMeetings) {
        // Convert meeting.start string to a dayjs object
        const meetingDate = dayjs(meeting.start);

        // Extract day, month, and year from meeting.start
        const meetingDay = meetingDate.date();
        const meetingMonth = meetingDate.month();
        const meetingYear = meetingDate.year();

        // Compare extracted values
        if (
          meetingDay === startDay &&
          meetingMonth === startMonth &&
          meetingYear === startYear
        ) {
          total++;
        }
      }
    }
    return total;
  };

  useEffect(() => {
    console.log('selectedMeetings: ', selectedMeetings);
  }, [selectedMeetings]);

  const getName = (rowData: MeetingWithAttendees) => {
    if (!datedMeetingsWithAttendees || !rowData) {
      return <div>Loading...</div>;
    }
    return rowData?.attendees?.map((attendee) => (
      <div className="meeting-attendee-name" key={attendee.id}>
        {attendee.name}
      </div>
    ));
  };

  const getStatusColorForTable = (getStatusForTable: string) => {
    switch (getStatusForTable) {
      case 'Met':
        return 'primary';

      case 'Student Absent':
        return 'secondary';

      case 'Tutor Absent':
        return 'secondary';

      case 'Student Unavailable':
        return 'secondary';

      case 'Tutor Unavailable':
        return 'secondary';
    }
  };

  const toggleAllCheckboxes = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedMeetings(filteredMeetings);
    } else {
      setSelectedMeetings([]);
    }
  };

  const isCheckboxChecked = (meeting: MeetingWithAttendees) => {
    return selectedMeetings.some(
      (selectedMeeting) => selectedMeeting.id === meeting.id
    );
  };

  const toggleCheckbox = (meeting: MeetingWithAttendees) => {
    // If checked, remove
    if (isCheckboxChecked(meeting)) {
      setSelectedMeetings(selectedMeetings.filter((m) => m.id !== meeting.id));
      return;
    }
    // Else select only this one
    setSelectedMeetings([meeting]);
    if (selectedMeetings.length > 0) {
    }
  };

  return (
    <Card className="lg:w-7 flex-order-1 lg:flex-order-2 elevate-item">
      <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
        <h3>Meetings</h3>
      </div>
      <DataTable
        value={filteredMeetings}
        emptyMessage="No meetings today."
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
        tableStyle={{ minWidth: '20rem' }}
        rowClassName={(rowData: MeetingWithAttendees) =>
          isCheckboxChecked(rowData) ? 'row-selected' : ''
        }>
        <Column
          header={() => (
            <Checkbox
              indeterminate={
                selectedMeetings.length > 0 &&
                selectedMeetings.length < filteredMeetings.length
              }
              checked={
                selectedMeetings.length === filteredMeetings.length &&
                filteredMeetings.length > 0
              }
              onChange={toggleAllCheckboxes}
            />
          )}
          body={(rowData: MeetingWithAttendees) => (
            <Checkbox
              checked={isCheckboxChecked(rowData)}
              onChange={() => toggleCheckbox(rowData)}
            />
          )}
          style={{ width: '3rem' }}
          headerStyle={{ width: '3rem' }}
        />
        <Column
          field="time"
          header="Time"
          body={formatMeetingTime}
          style={{ minWidth: '170px', maxWidth: 'calc(170px + 1.5rem)' }}
          sortable
        />
        <Column
          body={getName}
          header="Name"
          style={{ minWidth: '150px' }}
          sortable
        />
        <Column
          field="meeting_status"
          header="Meeting Status"
          body={statusBodyTemplate}
          style={{ minWidth: '130px', maxWidth: '180px' }}
          className="meeting-status"
          sortable
        />
      </DataTable>
    </Card>
  );
};

export default MeetingList;
