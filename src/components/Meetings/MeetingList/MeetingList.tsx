import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import dayjs, { type Dayjs } from 'dayjs';
import { type dummyMeetings } from '@prisma/client';

interface Props {
  selectedDate: Dayjs;
  getDatedMeetings: Meeting[];
  meetings: dummyMeetings[];
  selectedMeetings: Meeting[];
  setSelectedMeetings: (meetings: Meeting[]) => void;
}

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
  startDateString?: string;
}

const MeetingList: React.FC<Props> = ({
  selectedDate,
  getDatedMeetings = [],
  selectedMeetings = [],
  meetings = [],
  setSelectedMeetings = () => {
    meetings;
  },
}) => {
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  // const [selectedMeetings, setSelectedMeetings] = useState<Meeting[]>([]);
  const [selectedNames] = useState<string[]>([]);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedNames.length > 0) {
      const filteredData = getDatedMeetings.filter((meeting) =>
        selectedNames.includes(meeting.name)
      );
      setFilteredMeetings(filteredData);
      // setIsMeetingSelected(true);
    }
  }, [getDatedMeetings, selectedNames]);

  // const handleNameSelect = (names: string[]) => {
  //   setSelectedNames(names);
  // };

  useEffect(() => {
    if (!selectedDate) {
      setFilteredMeetings([]);
      return;
    }

    const filtered = getDatedMeetings
      .map((meeting) => ({
        ...meeting,
        dateString: dayjs(meeting.start).format('YYYY-MM-DD'),
      }))
      .filter((meeting) => {
        const meetingDate = dayjs(meeting.start);
        return meetingDate.isSame(selectedDate, 'day');
      });
    setFilteredMeetings(filtered);
  }, [getDatedMeetings, selectedDate]);

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
          <td colSpan={5}>
            <div className="flex justify-content-end font-bold w-full">
              Total Meetings:{' '}
              {calculateMeetingTotal(data.start?.toString() ?? '')}
            </div>
          </td>
        </div>
      </React.Fragment>
    );
  };

  const footerTemplate = () => {
    return <td colSpan={5} className="h-auto"></td>;
  };

  const statusBodyTemplate = (rowData: Meeting) => {
    return (
      <Chip
        color={getSeverity(rowData.meeting_status)}
        label={rowData.meeting_status}
        className="meeting-status-chips"
      />
    );
  };

  const formatMeetingTime = (data: dummyMeetings) => {
    const { start, end } = data;

    const formatTime = (time: Date | null): string => {
      const date = dayjs(time);
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

  const getSeverity = (meeting_status: string) => {
    switch (meeting_status) {
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

  const isCheckboxChecked = (meeting: Meeting) => {
    return selectedMeetings.some(
      (selectedMeeting) => selectedMeeting.id === meeting.id
    );
  };

  const toggleCheckbox = (meeting: Meeting) => {
    // If checked, remove
    if (isCheckboxChecked(meeting)) {
      setSelectedMeetings(selectedMeetings.filter((m) => m.id !== meeting.id));
      return;
    }

    // Else select only this one
    setSelectedMeetings([meeting]);
  };
  // const toggleCheckbox = (meeting: Meeting) => {
  //   let updatedMeetings: Meeting[];

  //   if (isCheckboxChecked(meeting)) {
  //     updatedMeetings = selectedMeetings.filter((m) => m.id !== meeting.id);
  //   } else {
  //     updatedMeetings = [...selectedMeetings, meeting];
  //   }

  //   if (updatedMeetings.length > 0) {
  //     setSelectedMeetings(updatedMeetings);
  //   } else {
  //     setSelectedMeetings([]);
  //   }
  // };

  // const toggleCheckbox = (meeting: Meeting) => {
  //   setSelectedMeetings((prevSelectedMeetings: Meeting[]): Meeting[] => {
  //     console.log('prevSelectedMeetings', prevSelectedMeetings);
  //     if (isCheckboxChecked(meeting)) {
  //       return prevSelectedMeetings.filter(
  //         (selectedMeeting) => selectedMeeting.id !== meeting.id
  //       );
  //     } else {
  //       return [...prevSelectedMeetings, meeting];
  //     }
  //   });
  // };

  return (
    <Card className="lg:w-7 flex-order-1 lg:flex-order-2 elevate-item">
      <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
        <h3>Meetings</h3>
        {/* <MeetingListNameSelect
          selectedNames={selectedNames}
          onNameSelect={handleNameSelect}
        /> */}
      </div>
      <DataTable
        value={filteredMeetings}
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
        rowClassName={(rowData: Meeting) =>
          isCheckboxChecked(rowData) ? 'row-selected' : ''
        }>
        <Column
          header={() => (
            <Checkbox
              // ref={selectAllCheckboxRef}
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
          body={(rowData: Meeting) => (
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
          field="name"
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
