import React, { useEffect, useMemo } from 'react';
import {
  Calendar,
  type CalendarDateTemplateEvent,
  type CalendarChangeEvent,
} from 'primereact/calendar';
import { Card } from 'primereact/card';
import dayjs, { type Dayjs } from 'dayjs';

interface Props {
  date: string | Date | Date[] | null;
  selectedDate: Dayjs;
  meetings: Meeting[];
  setSelectedDate: (date: Dayjs) => void;
}

interface Meeting {
  name: string;
  student_id: string;
  start: Date;
  end: Date;
  meeting_status: string;
  program: string;
  level_lesson: string;
  meeting_notes: string;
  recorded_by: string;
  recorded_on: Date;
  edited_by: string;
  edited_on: Date;
}

const MeetingCalendar: React.FC<Props> = ({
  selectedDate,
  meetings = [],
  setSelectedDate,
}) => {
  const meetingDates: string[] = useMemo(() => {
    if (meetings) {
      const uniqueDates = new Set(
        meetings.map((meeting) => dayjs(meeting.start).format('YYYY-MM-DD'))
      );
      return Array.from(uniqueDates);
    }
    return [];
  }, [meetings]);

  // interface SelectedDate {
  //   value: string;
  // }

  const handleDateChange = (e: CalendarChangeEvent) => {
    let selected: Dayjs;

    if (Array.isArray(e.value)) {
      // Handle multiple dates

      selected = dayjs(e.value[0]); // Use first date
    } else {
      // Handle single date
      selected = dayjs(e.value);
    }

    setSelectedDate(selected);
  };

  useEffect(() => {
    console.log('Meeting Dates:', meetingDates);
  }, [meetingDates]);

  // interface CalendarDate {
  //   year: string;
  //   month: number;
  //   day: string;
  // }
  const dateTemplate = (date: CalendarDateTemplateEvent) => {
    console.log('Date:', typeof date.year);
    console.log('CalendarDateTemplateEvent:', date);
    const dayFormatted =
      date.year +
      '-' +
      (Number(date.month) + 1).toString().padStart(2, '0') +
      '-' +
      date.day.toString().padStart(2, '0');

    if (meetingDates.includes(dayFormatted)) {
      return <span className="meeting-day">{date.day}</span>;
    }

    return date.day;
  };

  const selectedDateValue = selectedDate.toDate();

  return (
    <div className="card flex w-full">
      <Card className="meeting-calendar w-full">
        <Calendar
          value={selectedDateValue}
          onChange={handleDateChange}
          numberOfMonths={3}
          inline
          className="w-full"
          dateTemplate={dateTemplate}
        />
      </Card>
    </div>
  );
};

export default MeetingCalendar;
