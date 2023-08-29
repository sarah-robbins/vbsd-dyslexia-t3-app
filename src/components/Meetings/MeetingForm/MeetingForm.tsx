import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Card } from 'primereact/card';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { api } from '@/utils/api';
import { Toast } from 'primereact/toast';

const MeetingForm: React.FC<Props> = ({
  meetings,
  setMeetings,
  selectedDate,
  setSelectedDate,
  getStudentsBySchool = [],
  getDatedMeetings = [],
  selectedMeetings,
  setSelectedMeetings,
}) => {
  const toast = useRef(null);

  /* -------------------------------------------------------------------------- */
  /*                         Interfacing for TypeScript                         */
  /* -------------------------------------------------------------------------- */

  interface Props {
    selectedDate: Dayjs;
    setSelectedDate: (date: Dayjs) => void;
    getStudentsBySchool: unknown[];
    selectedMeeting: Meeting | null;
    isMeetingSelected: boolean;
  }

  interface FormValues {
    name: string;
    student_id: int;
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

  interface Meeting {
    name: string;
    student_id: int;
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

  /* -------------------------------------------------------------------------- */
  /*                             HANDLE NAME CHANGE                             */
  /* -------------------------------------------------------------------------- */

  const [name, setName] = React.useState('');

  const handleNameChange = (event: SelectChangeEvent) => {
    const name = event.target.value; // selected id
    setName(name);
  };

  /* -------------------------------------------------------------------------- */
  /*                            HANDLE DATE AND TIME                            */
  /* -------------------------------------------------------------------------- */

  const [date, setDate] = useState<Dayjs>(dayjs());
  // const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const [startTime, setStartTime] = useState<Dayjs>(dayjs());
  const [endTime, setEndTime] = useState<Dayjs>(dayjs());

  console.log('startTime', startTime);
  const handleStartTime = (time: Dayjs) => {
    const timeOnly = time.format('HH:mm:ss');
    setStartTime(timeOnly);
  };

  const handleEndTime = (time: Dayjs) => {
    const timeOnly = time.format('HH:mm:ss');
    setEndTime(timeOnly);
  };

  const startDateTime = `${selectedDate.format('YYYY-MM-DD')}T${startTime}`;
  const endDateTime = `${selectedDate.format('YYYY-MM-DD')}T${endTime}`;

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  /* -------------------------------------------------------------------------- */
  /*                               Status Options                               */
  /* -------------------------------------------------------------------------- */

  type StatusOption =
    | 'Met'
    | 'Student Unavailable'
    | 'Tutor Unavailable'
    | 'Student Absent'
    | 'Tutor Absent';

  const statusOptions: StatusOption[] = [
    'Met',
    'Student Unavailable',
    'Tutor Unavailable',
    'Student Absent',
    'Tutor Absent',
  ];

  const { status } = statusOptions || {};

  const options = [...statusOptions];

  if (status && !options.includes(status)) {
    options.push(status);
  }

  const [selectedStatus, setSelectedStatus] = useState(options[0]);

  const handleStatusChange = (event: SelectChangeEvent) => {
    const status = event.target.value; // selected id

    setFormValues({ ...formValues, meeting_status: status });
    setSelectedStatus(status);
  };

  /* -------------------------------------------------------------------------- */
  /*                           HANDLE SELECTED MEETING                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (selectedMeetings.length > 0) {
      console.log('selectedMeetings in the useEffect', selectedMeetings);
      const selectedMeeting = selectedMeetings[0];
      const name = selectedMeeting.name;
      setName(name);
      const start = dayjs(selectedMeeting.start);
      const end = dayjs(selectedMeeting.end);
      setStartTime(start);
      setEndTime(end);
      const meeting_status = selectedMeeting.meeting_status;
      console.log('meeting_status', meeting_status);
      setSelectedStatus(meeting_status);
      setFormValues({
        name: name,
        student_id: 0,
        start: new Date(start),
        end: new Date(end),
        meeting_status: meeting_status,
        program: '',
        level_lesson: '',
        meeting_notes: selectedMeeting.meeting_notes || '',
        recorded_by: '',
        recorded_on: new Date(),
        edited_by: '',
        edited_on: new Date(),
      });
    }
  }, [selectedMeetings]);

  useEffect(() => {
    if (selectedMeetings.length <= 0) {
      setFormValues({
        name: '',
        student_id: 0,
        start: new Date(),
        end: new Date(),
        meeting_status: '',
        program: '',
        level_lesson: '',
        meeting_notes: '',
        recorded_by: '',
        recorded_on: new Date(),
        edited_by: '',
        edited_on: new Date(),
      });
      setName('');
      setSelectedStatus('');
      setStartTime(dayjs());
      setEndTime(dayjs());
    }
  }, [selectedMeetings]);

  /* -------------------------------------------------------------------------- */
  /*                                Form Controls                               */
  /* -------------------------------------------------------------------------- */

  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    student_id: 0,
    start: new Date(),
    end: new Date(),
    meeting_status: '',
    program: '',
    level_lesson: '',
    meeting_notes: '',
    recorded_by: '',
    recorded_on: new Date(),
    edited_by: '',
    edited_on: new Date(),
  });

  console.log('formValues', formValues);

  /* ------------------- create Meeting ------------------- */
  const createMeetingMutation = api.meetings.createMeeting.useMutation();

  const handleAdd = (formValues: FormValues) => {
    const newMeeting = {
      id: 0,
      name: name,
      student_id: formValues.student_id,
      start: start,
      end: end,
      meeting_status: formValues.meeting_status,
      program: formValues.program,
      level_lesson: formValues.level_lesson,
      meeting_notes: formValues.meeting_notes,
      recorded_by: 'sarah',
      recorded_on: new Date(),
    };
    console.log('saved data is: ', newMeeting);
    createMeetingMutation.mutate(newMeeting);

    toast.current.show({
      severity: 'success',
      summary: 'This meeting has been added.',
      detail: newMeeting.name,
      life: 3000,
    });

    setName('');
    setSelectedStatus('');
    setStartTime(dayjs());
    setEndTime(dayjs());

    setFormValues({
      name: '',
      student_id: 0,
      start: new Date(),
      end: new Date(),
      meeting_status: '',
      program: '',
      level_lesson: '',
      meeting_notes: '',
      recorded_by: '',
      recorded_on: new Date(),
      edited_by: '',
      edited_on: new Date(),
    });
  };

  /* ------------------- edit Meeting ------------------- */
  const editMeetingMutation = api.meetings.editMeeting.useMutation();

  const editMeeting = (formValues: FormValues) => {
    const id = Number(selectedMeetings[0].id);
    const editedMeeting = {
      id: id,
      name: name,
      student_id: formValues.student_id,
      start: formValues.start,
      end: formValues.end,
      meeting_status: formValues.meeting_status,
      program: formValues.program,
      level_lesson: formValues.level_lesson,
      meeting_notes: formValues.meeting_notes || '',
      edited_by: 'sarah',
      edited_on: new Date(),
    };
    console.log('saved data is: ', editedMeeting);
    editMeetingMutation.mutate(editedMeeting);

    // setName('');
    // setSelectedStatus('');
    // setStartTime(dayjs());
    // setEndTime(dayjs());

    // setFormValues({
    //   name: '',
    //   student_id: 0,
    //   start: new Date(),
    //   end: new Date(),
    //   meeting_status: '',
    //   program: '',
    //   level_lesson: '',
    //   meeting_notes: '',
    //   recorded_by: '',
    //   recorded_on: new Date(),
    //   edited_by: '',
    //   edited_on: new Date(),
    // });
  };

  /* ------------------------------ DELETEMEETING ----------------------------- */

  const deleteMeetingMutation = api.meetings.deleteMeeting.useMutation();

  const handleDelete = () => {
    const id = Number(selectedMeetings[0].id);
    const confirm = window.confirm(
      'Are you sure you want to delete this meeting?'
    );
    if (!confirm) return;
    console.log('selectedMeetings[0].id', id);

    deleteMeetingMutation.mutate({ id });

    toast.current.show({
      severity: 'success',
      summary: 'This meeting has been deleted.',
      detail: selectedMeetings[0].name,
      life: 3000,
    });

    setName('');
    setSelectedStatus('');
    setStartTime(dayjs());
    setEndTime(dayjs());

    setFormValues({
      id: 0,
      name: '',
      student_id: 0,
      // start: new Date(),
      // end: new Date(),
      meeting_status: '',
      program: '',
      level_lesson: '',
      meeting_notes: '',
      recorded_by: '',
      recorded_on: new Date(),
      edited_by: '',
      edited_on: new Date(),
    });

    setSelectedMeetings([]);

    const filteredMeetings = meetings.filter((meeting) => meeting.id !== id);
    setMeetings(filteredMeetings);
  };

  /* -------------------------------------------------------------------------- */
  /*                          CONDITIONALS FOR THE FORM                         */
  /* -------------------------------------------------------------------------- */

  //check if id is greater than 0 and return true or false
  const existingMeeting =
    getDatedMeetings.id > 0 || selectedMeetings.length > 0;

  //check if the meeting exists in the database and return true or false
  const noMeeting =
    selectedMeetings.length <= 0 || selectedMeetings.length === undefined;

  /* ------------------------------------------------------------- */
  /*                           HTML RETURN                         */
  /* ------------------------------------------------------------- */

  return (
    <Card className="lg:w-5 flex-order-2 lg:flex-order-1 card">
      <Toast ref={toast} />

      <div className="flex justify-content-center gap-4 flex-column">
        <h3>Meeting Form</h3>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 0 },
          }}
          noValidate
          autoComplete="off"
          className="flex justify-content-center gap-4 flex-column">
          <FormControl className="w-12">
            <InputLabel id="demo-simple-select-label">Name</InputLabel>
            {/* I would like a Select component that uses the names of the students from the database data of Students. */}
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={name}
              label="Name"
              required
              onChange={handleNameChange}>
              {getStudentsBySchool.map((s) => (
                <MenuItem key={s.id} value={`${s.first_name} ${s.last_name}`}>
                  {s.last_name}, {s.first_name}
                </MenuItem>
              ))}
            </Select>
            {/* <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={age}
              label="Name"
              onChange={handleChange}>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select> */}
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              className="w-12"
              required
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </LocalizationProvider>
          <FormControl className="w-12">
            <InputLabel id="demo-simple-select-label">
              Meeting Status
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formValues.meeting_status ? formValues.meeting_status : ''}
              label="Meeting Status"
              required
              onChange={handleStatusChange}>
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex gap-4">
              <TimePicker
                label="Start Time"
                required
                value={startTime}
                onChange={handleStartTime}
              />
              <TimePicker
                label="End Time"
                required
                value={endTime}
                onChange={handleEndTime}
              />
            </div>
          </LocalizationProvider>
          <TextField
            id="outlined-multiline-flexible"
            value={formValues.meeting_notes}
            required
            onChange={(e) =>
              setFormValues({ ...formValues, meeting_notes: e.target.value })
            }
            label="Meeting Notes"
            multiline
            rows={4}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAdd(formValues)}
              disabled={existingMeeting}>
              Add
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => editMeeting(formValues)}
              disabled={noMeeting}>
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={noMeeting}>
              Delete
            </Button>
          </Stack>
        </Box>
      </div>
    </Card>
  );
};

export default MeetingForm;
