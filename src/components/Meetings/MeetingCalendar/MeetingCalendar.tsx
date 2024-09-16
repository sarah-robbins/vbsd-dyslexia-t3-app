import React, { type SyntheticEvent, useMemo } from "react";
import { Calendar, type CalendarDateTemplateEvent } from "primereact/calendar";
import { Card } from "primereact/card";
import dayjs, { type Dayjs } from "dayjs";
import { type FormEvent } from "primereact/ts-helpers";
import { type Meeting } from "@/types";

interface Props {
  allMeetings: Meeting[];
  selectedDate?: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  uniqueKey: number;
  viewDate: Dayjs;
  setViewDate: (date: Dayjs) => void;
}

const MeetingCalendar: React.FC<Props> = ({
  allMeetings,
  selectedDate,
  setSelectedDate,
  uniqueKey,
  viewDate,
  setViewDate,
}) => {

  const meetingDates: string[] = useMemo(() => {
    if (allMeetings) {
      const uniqueDates = new Set(
        allMeetings.map((meeting) => dayjs(meeting.start).format("YYYY-MM-DD"))
      );
      return Array.from(uniqueDates);
    }
    return [];
  }, [allMeetings]);

  const handleDateChange = (
    event: FormEvent<Date, SyntheticEvent<Element, Event>>
  ) => {
    let selected: Dayjs;

    if (Array.isArray(event.value)) {
      selected = dayjs(event.value);
    } else {
      selected = dayjs(event.value);
    }

    setSelectedDate(selected);

    const dateAsDate = selected.subtract(1, 'month').startOf('month');

    setViewDate(dateAsDate);
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
          onChange={handleDateChange}
          numberOfMonths={3}
          inline
          className="w-full"
          dateTemplate={dateTemplate}
          viewDate={viewDate.toDate()}
          onViewDateChange={(e) => setViewDate(dayjs(e.value))}
        />
      </Card>
    </div>
  );
};

export default MeetingCalendar;
