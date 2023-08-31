import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Chip from '@mui/material/Chip';
import MeetingListNameSelect from './MeetingListNameSelect/MeetingListNameSelect';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';

interface Props {
  selectedDate: string;
  getDatedMeetings: Meeting[];
  selectedMeetings: Meeting[];
  meetings: Meeting[];
  setSelectedMeetings: (meetings: Meeting[]) => void;
}

interface Meeting {
  id: string;
  name: string;
  student_id: string;
  start: string;
  end: string;
  meeting_status: string;
  program: string;
  level_lesson: string;
  meeting_notes: string;
  recorded_by: string;
  recorded_on: string;
  edited_by: string;
  edited_on: string;
}

const MeetingList: React.FC<Props> = ({
  selectedDate = '',
  getDatedMeetings = [],
  selectedMeetings = [],
  meetings = [],
  setSelectedMeetings = () => {
    meetings;
  },
}) => {
  console.log('selectedMeetings', selectedMeetings);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  // const [selectedMeetings, setSelectedMeetings] = useState<Meeting[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
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

  const handleNameSelect = (names: string[]) => {
    setSelectedNames(names);
  };

  useEffect(() => {
    if (!selectedDate) {
      setFilteredMeetings([]);
      return;
    }

    const filtered = getDatedMeetings.filter((meeting) => {
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
    const originalDate = data.start;
    const date = new Date(originalDate);

    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const getOrdinalSuffix = (day) => {
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

    const formattedDate = formatter.format(date);
    const dayOfMonth = date.getDate();
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
          <td colSpan="5">
            <div className="flex justify-content-end font-bold w-full">
              Total Meetings: {calculateMeetingTotal(data.start)}
            </div>
          </td>
        </div>
      </React.Fragment>
    );
  };

  const footerTemplate = () => {
    return <td colSpan="5" className="h-auto"></td>;
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

  const formatMeetingTime = (data: Meeting) => {
    const start = data.start;
    const end = data.end;

    const formatTime = (timeString) => {
      const date = new Date(timeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();

      const isPM = hours >= 12;
      const formattedHours = isPM ? hours % 12 || 12 : hours;
      const formattedTime = `${formattedHours}:${minutes
        .toString()
        .padStart(2, '0')}`;

      const period = isPM ? 'pm' : 'am';

      return formattedTime + period;
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

  const calculateMeetingTotal = (start: string) => {
    let total = 0;

    if (getDatedMeetings) {
      for (const meeting of getDatedMeetings) {
        if (meeting.start === start) {
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
    setSelectedMeetings((prevSelectedMeetings) => {
      if (isCheckboxChecked(meeting)) {
        return prevSelectedMeetings.filter(
          (selectedMeeting) => selectedMeeting.id !== meeting.id
        );
      } else {
        return [...prevSelectedMeetings, meeting];
      }
    });
  };

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
        groupRowsBy="start"
        sortMode="single"
        sortField="start"
        sortOrder={-1}
        scrollable
        scrollHeight="510px"
        rowGroupHeaderTemplate={headerTemplate}
        rowGroupFooterTemplate={footerTemplate}
        dataKey="id"
        stripedRows
        tableStyle={{ minWidth: '20rem' }}
        rowClassName={(rowData) =>
          isCheckboxChecked(rowData) ? 'row-selected' : ''
        }>
        <Column
          header={() => (
            <Checkbox
              ref={selectAllCheckboxRef}
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
