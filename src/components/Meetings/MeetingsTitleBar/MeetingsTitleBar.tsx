import { Button } from '@mui/material';
import React, { useState } from 'react';
import CalendarSpanPicker from '../CalendarSpanPicker/CalendarSpanPicker';
import dayjs from 'dayjs';

const MeetingsTitleBar = ({ setSelectedDate }) => {
  const [date, setDate] = useState<string | Date | Date[] | null>(null);

  const handleTodayClick = () => {
    const today = dayjs();
    setSelectedDate(today);
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
