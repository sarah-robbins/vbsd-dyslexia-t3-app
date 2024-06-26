import React, { type SyntheticEvent, useMemo } from "react";
import { Calendar, type CalendarDateTemplateEvent } from "primereact/calendar";
import { Card } from "primereact/card";
import dayjs, { type Dayjs } from "dayjs";
import { type Meeting } from "@/types";
import { type FormEvent } from "primereact/ts-helpers";

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
  // date,
  // setDate,
}) => {
  const meetingDates: string[] = useMemo(() => {
    if (meetings) {
      const uniqueDates = new Set(
        meetings.map((meeting) => dayjs(meeting.start).format("YYYY-MM-DD"))
      );
      return Array.from(uniqueDates);
    }
    return [];
  }, [meetings]);

  const handleDateChange = (
    event: FormEvent<Date, SyntheticEvent<Element, Event>>
  ) => {
    let selected: Dayjs;

    if (Array.isArray(event.value)) {
      selected = dayjs(event.value);
    } else {
      selected = dayjs(event.value);
    }

    console.log("date from MeetingCalendar.tsx:", selected);
    setSelectedDate(selected);
    return dayjs(selectedDate).toDate();
  };

  const dateTemplate = (event: CalendarDateTemplateEvent) => {
    const dayFormatted =
      event.year.toString() +
      "-" +
      (Number(event.month) + 1).toString().padStart(2, "0") +
      "-" +
      event.day.toString().padStart(2, "0");

    if (meetingDates.includes(dayFormatted)) {
      return <span className="meeting-day">{event.day}</span>;
    }
    return event.day;
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
          // onChange={(e) => setSelectedDate(e.value)}
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
