import { Button } from '@mui/material';
import React from 'react';
// import CalendarSpanPicker from '../CalendarSpanPicker/CalendarSpanPicker';
import dayjs, { type Dayjs } from 'dayjs';
// import { type Calendar } from 'primereact/calendar';

interface Props {
  setSelectedDate: (date: Dayjs) => void | null;
  // calendarRef: React.MutableRefObject<Calendar | null>;
}

const MeetingsTitleBar: React.FC<Props> = ({
  setSelectedDate,
  // calendarRef,
}) => {
  // const [date, setDate] = useState<string | Date | Date[] | null>(null);

  const handleTodayClick = () => {
    setSelectedDate(dayjs());
    // calendarRef.current?.setDate(dayjs().toDate());
  };

  return (
    <>
      <div className="meetings-title-left flex gap-4 align-items-center">
        <Button variant="outlined" onClick={handleTodayClick}>
          Today
        </Button>
        <h3>My Students</h3>
      </div>
      <div className="meetings-title-right">{/* <CalendarSpanPicker /> */}</div>
    </>
  );
};

export default MeetingsTitleBar;
