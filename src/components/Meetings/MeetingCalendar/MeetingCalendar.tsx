import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, type CalendarChangeEvent } from 'primereact/calendar';
import { Card } from 'primereact/card';
import dayjs from 'dayjs';

interface Props {
  selectedDate: Date;
  meetings: any[];
  setSelectedDate: (date: Date) => void;
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

  const handleDateChange = (date: Date | string) => {
    const selected = dayjs(date.value);
    setSelectedDate(selected);
  };

  useEffect(() => {
    console.log('Meeting Dates:', meetingDates);
  }, [meetingDates]);

  interface CalendarDate {
    year: string;
    month: number;
    day: string;
  }
  const dateTemplate = (date: CalendarDate) => {
    const dayFormatted =
      date.year +
      '-' +
      (date.month + 1).toString().padStart(2, '0') +
      '-' +
      date.day.toString().padStart(2, '0');

    if (meetingDates.includes(dayFormatted)) {
      return <span className="meeting-day">{date.day}</span>;
    }

    return date.day;
  };

  return (
    <div className="card flex w-full">
      <Card className="meeting-calendar w-full">
        <Calendar
          value={selectedDate}
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