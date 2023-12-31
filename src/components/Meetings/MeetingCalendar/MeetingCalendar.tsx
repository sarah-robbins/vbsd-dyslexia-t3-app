import React, { useMemo } from 'react';
import {
  Calendar,
  type CalendarChangeEvent,
  type CalendarDateTemplateEvent,
} from 'primereact/calendar';
import { Card } from 'primereact/card';
import dayjs, { type Dayjs } from 'dayjs';
import { type Meeting } from '@/types';

interface Props {
  date: Dayjs | null;
  selectedDate?: Dayjs;
  meetings: Meeting[];
  setSelectedDate: (date: Dayjs) => void;
  uniqueKey: number;
  viewDate: Dayjs;
  setDate: (date: Dayjs) => void;
}

const MeetingCalendar: React.FC<Props> = ({
  selectedDate,
  meetings,
  setSelectedDate,
  uniqueKey,
  viewDate,
  date,
  setDate,
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

  // useEffect(() => {}, [meetingDates]);

  // interface CalendarDate {
  //   year: string;
  //   month: number;
  //   day: string;
  // }
  const dateTemplate = (date: CalendarDateTemplateEvent) => {
    const dayFormatted =
      date.year.toString() +
      '-' +
      (Number(date.month) + 1).toString().padStart(2, '0') +
      '-' +
      date.day.toString().padStart(2, '0');

    if (meetingDates.includes(dayFormatted)) {
      return <span className="meeting-day">{date.day}</span>;
    }

    return date.day;
  };

  const selectedDateValue = dayjs(selectedDate).toDate();

  return (
    <div className="card flex w-full">
      <Card className="meeting-calendar w-full">
        <Calendar
          key={uniqueKey}
          value={selectedDateValue}
          // value={date}
          onChange={handleDateChange}
          // onChange={(e) => {
          //   setDate(e.value);
          // }}
          numberOfMonths={3}
          inline
          className="w-full"
          dateTemplate={dateTemplate}
          // viewDate={firstMonthInView}
          viewDate={viewDate.toDate()}
        />
      </Card>
    </div>
  );
};

export default MeetingCalendar;
