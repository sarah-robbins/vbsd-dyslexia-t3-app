// @ts-nocheck

import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { MeetingsData } from '@/data/MeetingsData';
import { Divider } from '@mui/material';

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

interface MeetingListNameSelectProps {
  selectedNames: string[];
  onNameSelect: (names: string[]) => void;
}

const MeetingListNameSelect: React.FC<MeetingListNameSelectProps> = ({
  selectedNames,
  onNameSelect,
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedNamesValue, setSelectedNamesValue] = useState<string[]>([]);

  useEffect(() => {
    MeetingsData.getMeetings().then((data) => setMeetings(data));
  }, []);

  const uniqueNames = Array.from(new Set(meetings.map((item) => item.name)));

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedValues = event.target.value as string[];
    setSelectedNamesValue(selectedValues);
    onNameSelect(selectedValues);
  };

  const handleAllMeetingsCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedNamesValue(uniqueNames);
      onNameSelect(uniqueNames);
    } else {
      setSelectedNamesValue([]);
      onNameSelect([]);
    }
  };

  const handleNameCheckboxChange = (
    name: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;
    const selectedValues = [...selectedNamesValue];

    if (isChecked) {
      selectedValues.push(name);
    } else {
      const index = selectedValues.indexOf(name);
      if (index !== -1) {
        selectedValues.splice(index, 1);
      }
    }

    setSelectedNamesValue(selectedValues);
    onNameSelect(selectedValues);
  };

  const allMeetingsCheckboxChecked =
    selectedNamesValue.length === uniqueNames.length && uniqueNames.length > 0;

  const allMeetingsCheckboxIndeterminate =
    selectedNamesValue.length > 0 &&
    selectedNamesValue.length < uniqueNames.length;

  return (
    <FormControl sx={{ minWidth: 150 }} size="small">
      <InputLabel id="demo-multiple-checkbox-label">Names</InputLabel>
      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={selectedNamesValue}
        onChange={handleChange}
        renderValue={(selected) => (selected as string[]).join(', ')}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
          getContentAnchorEl: null,
        }}>
        <MenuItem value="">
          <Checkbox
            checked={allMeetingsCheckboxChecked}
            indeterminate={allMeetingsCheckboxIndeterminate}
            onChange={handleAllMeetingsCheckboxChange}
          />
          All Meetings
        </MenuItem>
        <Divider />
        {uniqueNames.map((name) => (
          <MenuItem key={name} value={name}>
            <Checkbox
              checked={selectedNamesValue.includes(name)}
              onChange={(e) => handleNameCheckboxChange(name, e)}
            />
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MeetingListNameSelect;
