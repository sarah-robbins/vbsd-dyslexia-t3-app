import { Button } from '@mui/material';
import React from 'react';
// import CalendarSpanPicker from '../CalendarSpanPicker/CalendarSpanPicker';
import dayjs, { type Dayjs } from 'dayjs';
// import { type Calendar } from 'primereact/calendar';

type SetUniqueKey = React.Dispatch<React.SetStateAction<number>>;

interface Props {
  setSelectedDate: (date: Dayjs) => void | null;
  setDate: (date: Dayjs) => void | null;
  setViewDate: (date: Dayjs) => void | null;
  setUniqueKey: SetUniqueKey;
}

const MeetingsTitleBar: React.FC<Props> = ({
  setSelectedDate,
  setDate,
  setViewDate,
  setUniqueKey,
}) => {
  // const [date, setDate] = useState<string | Date | Date[] | null>(null);

  // const handleTodayClick = () => {
  //   setSelectedDate(dayjs());
  //   // calendarRef.current?.setDate(dayjs().toDate());
  // };

  const handleTodayClick = () => {
    const today = dayjs();
    setDate(today);
    setSelectedDate(today);

    const dateAsDate = today.subtract(1, 'month').startOf('month');
    setViewDate(dateAsDate);

    setUniqueKey((prevKey: number) => prevKey + 1); // update key on click
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
