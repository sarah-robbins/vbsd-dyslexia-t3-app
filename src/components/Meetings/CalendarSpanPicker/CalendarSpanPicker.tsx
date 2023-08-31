// @ts-nocheck

import * as React from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { Divider, TextField, styled } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OutlinedInput from '@mui/material/OutlinedInput';

const MonthSpanButton = styled(Button)({
  textTransform: 'none',
  padding: '6px 12px',
});

const CalendarSpanPicker = () => {
  return (
    <PopupState variant="popover" popupId="demo-popup-popover">
      {(popupState) => (
        <div>
          <OutlinedInput
            placeholder="show current month span"
            size="small"
            {...bindTrigger(popupState)}
          />
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}>
            <div className="flex flex-column p-3">
              <div className="year-select flex align-items-center">
                <IconButton size="small" className="mr-2">
                  <ChevronLeftIcon />
                </IconButton>
                2023
                <IconButton size="small" className="ml-2">
                  <ChevronRightIcon />
                </IconButton>
              </div>
              <Divider />
              <div className="month-span-select flex flex-column">
                <MonthSpanButton
                  className="flex justify-content-between"
                  color="secondary">
                  <span>Jan</span> &lt;-&gt; <span>Mar</span>
                </MonthSpanButton>
                <MonthSpanButton
                  className="flex justify-content-between"
                  color="secondary">
                  <span>April</span> &lt;-&gt; <span>June</span>
                </MonthSpanButton>
                <MonthSpanButton
                  className="flex justify-content-between"
                  color="secondary">
                  <span>July</span> &lt;-&gt; <span>Sept</span>
                </MonthSpanButton>
                <MonthSpanButton
                  className="flex justify-content-between"
                  color="secondary">
                  <span>Oct</span> &lt;-&gt; <span>Dec</span>
                </MonthSpanButton>
              </div>
            </div>
          </Popover>
        </div>
      )}
    </PopupState>
  );
};

export default CalendarSpanPicker;
