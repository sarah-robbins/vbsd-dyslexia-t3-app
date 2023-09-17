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
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { type dummyStudents, type dummyMeetings } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/*                         Interfacing for TypeScript                         */
/* -------------------------------------------------------------------------- */

interface Props {
  meetings: dummyMeetings[];
  setMeetings: (meetings: dummyMeetings[]) => void;
  selectedMeetings: Meeting[];
  setSelectedMeetings: (meetings: Meeting[]) => void;
  getDatedMeetings: Meeting[];
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  getStudentsBySchool: dummyStudents[];
  isMeetingSelected: boolean;
}

interface Meeting {
  id?: number;
  name: string;
  student_id?: number;
  start?: Dayjs;
  end?: Dayjs;
  meeting_status: string;
  program?: string;
  level_lesson?: string;
  meeting_notes?: string;
  recorded_by: string;
  recorded_on: Dayjs;
  edited_by?: string;
  edited_on?: Dayjs;
}

interface FormValues {
  id?: number;
  name: string;
  student_id?: number;
  start: Dayjs | Date;
  end: Dayjs | Date;
  meeting_status: string;
  program?: string;
  level_lesson?: string;
  meeting_notes?: string;
  recorded_by: string;
  recorded_on: Dayjs | Date;
  edited_by: string;
  edited_on?: Dayjs | Date;
}

const MeetingForm: React.FC<Props> = ({
  meetings,
  setMeetings,
  selectedDate,
  // setSelectedDate,
  getStudentsBySchool = [],
  // getDatedMeetings = [],
  selectedMeetings = [],
  // setSelectedMeetings = [],
}) => {
  const toast = useRef<Toast>(null);
  const toastDelete = useRef<Toast>(null);
  const [formDate, setFormDate] = useState(selectedDate);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    student_id: 0,
    start: dayjs(),
    end: dayjs(),
    meeting_status: '',
    program: '',
    level_lesson: '',
    meeting_notes: '',
    recorded_by: '',
    recorded_on: dayjs(),
    edited_by: '',
    edited_on: dayjs(),
  });

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

  // const [date] = useState<Dayjs>(dayjs());
  // const [selectedDate, setSelectedDate] = useState(null);

  // useEffect(() => {
  //   setSelectedDate(date);
  // }, [date, setSelectedDate]);

  // When selectedDate updates
  useEffect(() => {
    setFormDate(selectedDate);
  }, [selectedDate]);

  const handleFormDateChange = (date: Dayjs | null) => {
    if (date) {
      setFormDate(date);
    }
  };

  const [startTime, setStartTime] = useState<Dayjs>(dayjs());
  const [endTime, setEndTime] = useState<Dayjs>(dayjs());

  const handleStartTime = (time: Dayjs | null) => {
    if (time) {
      const timeOnly = dayjs(time);
      setStartTime(timeOnly);
    }
  };

  const handleEndTime = (time: Dayjs | null) => {
    const timeOnly = dayjs(time);
    setEndTime(dayjs(timeOnly));
  };

  const startTimeToString = startTime.format('HH:mm:ss');
  const endTimeToString = endTime.format('HH:mm:ss');

  const dateFromForm = formDate || dayjs();
  const startDateTime = `${dayjs(dateFromForm?.toDate()).format(
    'YYYY-MM-DD'
  )}T${startTimeToString}`;
  const endDateTime = `${dayjs(dateFromForm?.toDate()).format(
    'YYYY-MM-DD'
  )}T${endTimeToString}`;

  const start = startDateTime;
  const end = endDateTime;

  /* -------------------------------------------------------------------------- */
  /*                               Status Options                               */
  /* -------------------------------------------------------------------------- */

  const statusOptions: string[] = [
    'Met',
    'Student Unavailable',
    'Tutor Unavailable',
    'Student Absent',
    'Tutor Absent',
  ];

  const options = [...statusOptions];

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const handleStatusChange = (event: SelectChangeEvent) => {
    const selectedStatus = event.target.value; // selected id
    setFormValues({ ...formValues, meeting_status: selectedStatus });
    setSelectedStatus(selectedStatus);
  };

  /* -------------------------------------------------------------------------- */
  /*                               Program Options                               */
  /* -------------------------------------------------------------------------- */
  console.log('selectedMeetings: ', selectedMeetings);

  const programOptions: string[] = ['Barton', 'Connections', 'Foundations'];

  const programs = [...programOptions];

  const [selectedProgram, setSelectedProgram] = useState<string>('');
  console.log(selectedProgram);
  const handleProgramChange = (event: SelectChangeEvent) => {
    const selectedProgram = event.target.value; // selected id
    setFormValues({ ...formValues, program: selectedProgram });
    setSelectedProgram(selectedProgram);
  };
  console.log('formValues: ', formValues);

  /* -------------------------------------------------------------------------- */
  /*                           HANDLE SELECTED MEETING                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (selectedMeetings.length > 0) {
      const selectedMeeting = selectedMeetings[0];
      if (!selectedMeeting) return;
      const name = selectedMeeting.name;
      setName(name);
      setFormDate(dayjs(selectedMeeting.start));
      const start = dayjs(selectedMeeting.start);
      const end = dayjs(selectedMeeting.end);
      setStartTime(start);
      setEndTime(end);
      const meeting_status = selectedMeeting.meeting_status;
      setSelectedStatus(meeting_status);
      setFormValues({
        name: name,
        student_id: 0,
        start: dayjs(start),
        end: dayjs(end),
        meeting_status: meeting_status,
        program: selectedMeeting.program || '',
        level_lesson: selectedMeeting.level_lesson || '',
        meeting_notes: selectedMeeting.meeting_notes || '',
        recorded_by: '',
        recorded_on: dayjs(),
        edited_by: '',
        edited_on: dayjs(),
      });
    }
  }, [selectedMeetings]);

  useEffect(() => {
    if (selectedMeetings.length <= 0) {
      setFormValues({
        name: '',
        student_id: 0,
        start: dayjs(),
        end: dayjs(),
        meeting_status: '',
        program: '',
        level_lesson: '',
        meeting_notes: '',
        recorded_by: '',
        recorded_on: dayjs(),
        edited_by: '',
        edited_on: dayjs(),
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

  /* ------------------- create Meeting ------------------- */
  const createMeetingMutation = api.meetings.createMeeting.useMutation();

  const handleAdd = (formValues: FormValues) => {
    const newMeeting = {
      id: 0,
      name: name,
      student_id: formValues.student_id ?? 0,
      start: dayjs(start).toDate(),
      end: dayjs(end).toDate(),
      meeting_status: formValues.meeting_status,
      program: formValues.program ?? '',
      level_lesson: formValues.level_lesson ?? '',
      meeting_notes: formValues.meeting_notes ?? '',
      recorded_by: 'sarah',
      recorded_on: dayjs().toDate(),
    };
    createMeetingMutation.mutate(newMeeting);

    toast.current?.show({
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
      start: dayjs(),
      end: dayjs(),
      meeting_status: '',
      program: '',
      level_lesson: '',
      meeting_notes: '',
      recorded_by: '',
      recorded_on: dayjs(),
      edited_by: '',
      edited_on: dayjs(),
    });
  };

  /* ------------------- edit Meeting ------------------- */
  const editMeetingMutation = api.meetings.editMeeting.useMutation();

  const editMeeting = (formValues: FormValues) => {
    if (!selectedMeetings) {
      return;
    }
    const id = selectedMeetings[0]?.id;
    const editedMeeting = {
      id: id,
      name: name,
      student_id: formValues.student_id ?? 0,
      start: dayjs(start).toDate(),
      end: dayjs(end).toDate(),
      meeting_status: formValues.meeting_status,
      program: formValues.program ?? '',
      level_lesson: formValues.level_lesson ?? '',
      meeting_notes: formValues.meeting_notes ?? '',
      edited_by: 'sarah',
      edited_on: dayjs().toDate(),
    };
    editMeetingMutation.mutate(editedMeeting);

    // setName('');
    // setSelectedStatus('');
    // setStartTime(dayjs());
    // setEndTime(dayjs());

    // setFormValues({
    //   name: '',
    //   student_id: 0,
    //   start: dayjs(),
    //   end: dayjs(),
    //   meeting_status: '',
    //   program: '',
    //   level_lesson: '',
    //   meeting_notes: '',
    //   recorded_by: '',
    //   recorded_on: dayjs(),
    //   edited_by: '',
    //   edited_on: dayjs(),
    // });
  };

  /* ------------------------------ DELETEMEETING ----------------------------- */

  const deleteMeetingMutation = api.meetings.deleteMeeting.useMutation();

  const handleDelete = () => {
    const id = Number(selectedMeetings[0]?.id);
    // const confirm = window.confirm(
    //   'Are you sure you want to delete this meeting?'
    // );
    // if (!confirm) return;

    toastDelete.current?.show({
      severity: 'info',
      sticky: true,
      className: 'border-none',
      content: (
        <div
          className="flex flex-column align-items-center"
          style={{ flex: '1' }}>
          <div className="text-center">
            <i
              className="pi pi-exclamation-triangle"
              style={{ fontSize: '3rem' }}></i>
            <div className="font-bold text-xl my-3">
              Are you sure you want to delete {selectedMeetings[0]?.name}?
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                try {
                  deleteMeetingMutation.mutate({ id: id });
                } catch (error) {
                  console.error(
                    `Error deleting ${selectedMeetings[0]?.name ?? ''}`
                  );
                }

                if (deleteMeetingMutation.isSuccess) {
                  toast.current?.show({
                    severity: 'success',
                    summary: 'This meeting has been deleted.',
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
                    start: dayjs(),
                    end: dayjs(),
                    meeting_status: '',
                    program: '',
                    level_lesson: '',
                    meeting_notes: '',
                    recorded_by: '',
                    recorded_on: dayjs(),
                    edited_by: '',
                    edited_on: dayjs(),
                  });

                  setMeetings(meetings.filter((meeting) => meeting.id !== id));
                  toastDelete.current?.clear();
                }

                if (deleteMeetingMutation.isError) {
                  toast.current?.show({
                    severity: 'error',
                    summary:
                      'There was an error, and this meeting was not deleted.',
                    life: 3000,
                  });
                }
              }}
              variant="contained"
              color="primary">
              Confirm
            </Button>
            <Button
              onClick={() => toastDelete.current?.clear()}
              variant="contained"
              color="secondary">
              Cancel
            </Button>
          </div>
        </div>
      ),
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                          CONDITIONALS FOR THE FORM                         */
  /* -------------------------------------------------------------------------- */

  //check if id is greater than 0 and return true or false
  const existingMeeting = selectedMeetings.length > 0;

  //check if the meeting exists in the database and return true or false
  const noMeeting =
    selectedMeetings.length <= 0 || selectedMeetings.length === undefined;

  /* ------------------------------------------------------------- */
  /*                           HTML RETURN                         */
  /* ------------------------------------------------------------- */

  return (
    <Card className="lg:w-5 flex-order-2 lg:flex-order-1 card">
      <Toast ref={toast} />
      <Toast ref={toastDelete} />
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
              onChange={handleNameChange}
              renderValue={(selected) => selected}>
              {/* {getStudentsBySchool.map((s) => (
                <MenuItem key={s.id} value={`${s.first_name} ${s.last_name}`}>
                  {s.last_name}, {s.first_name}
                </MenuItem>
              ))} */}
              {getStudentsBySchool.map((s) => (
                <MenuItem
                  key={s.id}
                  value={`${s.first_name ?? 'Unknown'} ${
                    s.last_name ?? 'Unknown'
                  }`}>
                  <Checkbox checked={name.indexOf(s.id.toString()) > -1} />
                  <ListItemText
                    primary={`${s.last_name ?? 'Unknown'}, ${
                      s.first_name ?? 'Unknown'
                    }`}
                  />
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
              value={formDate}
              onChange={handleFormDateChange}
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

          <FormControl className="w-12">
            <InputLabel id="demo-simple-select-label">Program</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formValues.program ? formValues.program : ''}
              label="Program"
              required
              // onChange={handleStatusChange}>
              onChange={handleProgramChange}>
              {programs.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            id="outlined-multiline-flexible"
            value={formValues.level_lesson}
            required
            onChange={(e) =>
              setFormValues({ ...formValues, level_lesson: e.target.value })
            }
            label="Level/Lesson"
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex gap-4">
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={handleStartTime}
              />
              <TimePicker
                label="End Time"
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
            {/* <Button
              variant="contained"
              color="primary"
              onClick={() => handleAdd(formValues)}
              disabled={existingMeeting}>
              Add
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (existingMeeting) {
                  editMeeting(formValues);
                } else {
                  handleAdd(formValues);
                }
              }}>
              Save
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
