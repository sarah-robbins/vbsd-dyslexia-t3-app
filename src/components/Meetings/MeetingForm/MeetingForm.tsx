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
import type {
  Student,
  Meeting,
  MeetingAttendees,
  FormValues,
  MeetingWithAttendees,
} from '@/types';
// import useCurrentAttendees from '@/hooks';
import { OutlinedInput } from '@mui/material';
import { useSession } from 'next-auth/react';

/* -------------------------------------------------------------------------- */
/*                         Interfacing for TypeScript                         */
/* -------------------------------------------------------------------------- */

interface Props {
  meetings: MeetingWithAttendees[];
  setMeetings: (meetings: MeetingWithAttendees[]) => void;
  selectedMeetings: MeetingWithAttendees[];
  setSelectedMeetings: (meetings: MeetingWithAttendees[]) => void;
  getDatedMeetings: MeetingWithAttendees[];
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  getStudentsBySchool: Student[];
  isMeetingSelected: boolean;
  selectedMeetingAttendees: MeetingAttendees[];
  setDatedMeetingsWithAttendees: (meetings: MeetingWithAttendees[]) => void;
  // attendees: MeetingAttendees[];
}

// interface FormValues {
//   id?: number;
//   // name: string;
//   name: [];
//   student_id?: number;
//   start: Dayjs | Date;
//   end: Dayjs | Date;
//   meeting_status: string;
//   program?: string;
//   level_lesson?: string;
//   meeting_notes?: string;
//   recorded_by: string;
//   recorded_on: Dayjs | Date;
//   edited_by: string;
//   edited_on?: Dayjs | Date;
// }

const MeetingForm: React.FC<Props> = ({
  meetings,
  setMeetings,
  selectedDate,
  // setSelectedDate,
  getStudentsBySchool = [],
  getDatedMeetings = [],
  selectedMeetings = [],
  setDatedMeetingsWithAttendees,
  // setSelectedMeetings = [],
  // selectedMeetingAttendees = [],
  // attendees = [],
}) => {
  const { data: session } = useSession();
  const sessionData = session?.user;

  const toast = useRef<Toast>(null);
  const toastDelete = useRef<Toast>(null);
  const [attendees, setAttendees] = useState<MeetingAttendees[]>([]);
  const [formDate, setFormDate] = useState(selectedDate);
  const [formValues, setFormValues] = useState<FormValues>({
    // name: '',
    name: [],
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

  useEffect(() => {
    if (selectedDate && getDatedMeetings) {
      const datedMeetingsWithAttendees: MeetingWithAttendees[] =
        getDatedMeetings.map((meeting): MeetingWithAttendees => {
          const students = getStudentsBySchool;
          const attendees = (meeting.MeetingAttendees ?? [])
            .map((attendee) => {
              const student = students?.find(
                (s) => s.id === attendee.student_id
              );
              if (!student) return;
              return {
                ...attendee,
                id: attendee.student_id,
                name: `${student.first_name ?? ''} ${student.last_name ?? ''}`,
              };
            })
            .filter(
              (
                a
              ): a is {
                id: number;
                meeting_id: number;
                student_id: number;
                meeting_status: string | null;
                created_at: Dayjs | null;
                name: string;
              } => Boolean(a)
            ) as {
            id: number;
            meeting_id: number;
            student_id: number;
            meeting_status: string | null;
            created_at: Dayjs | null;
            name: string;
          }[]; // Filter out undefined or null values
          // TODO: attendees has typescript errors
          return { ...meeting, attendees };
        });

      setDatedMeetingsWithAttendees(datedMeetingsWithAttendees);
    }
  }, [getDatedMeetings, getStudentsBySchool, selectedDate]);

  /* -------------------------------------------------------------------------- */
  /*                             HANDLE NAME CHANGE                             */
  /* -------------------------------------------------------------------------- */

  // const [name, setName] = React.useState('');
  const [name, setName] = React.useState<string[]>([]);
  const [studentNames, setStudentNames] = React.useState<string[]>([]);
  const [selectedNames, setSelectedNames] = React.useState<string[]>([]);
  const [namesForSelect, setNamesForSelect] = React.useState<string[]>([]);

  const handleNameChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const newSelectedNames =
      typeof value === 'string' ? value.split(',') : value;

    // Update individualStatuses for new selections
    const newStatuses = { ...individualStatuses };
    newSelectedNames.forEach((name) => {
      if (!newStatuses[name]) {
        newStatuses[name] = ''; // Set a default status, or use your logic to determine this
      }
    });

    setSelectedNames(newSelectedNames);
    setIndividualStatuses(newStatuses);
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
      console.log('date from handleFormDateChange', date);
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
  const [individualStatuses, setIndividualStatuses] = useState<{
    [key: string]: string;
  }>({});

  const statusOptions: string[] = [
    'Met',
    'Student Unavailable',
    'Tutor Unavailable',
    'Student Absent',
    'Tutor Absent',
  ];

  const options = [...statusOptions];

  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    const allAttendees = selectedMeetings.flatMap(
      (meeting) => meeting.attendees
    );

    if (allAttendees.length > 1) {
      const initialStatuses = allAttendees.reduce((acc, attendee) => {
        const attendeeName = attendee.name;
        acc[attendeeName] = attendee.meeting_status || '';
        return acc;
      }, {} as { [key: string]: string });
      setIndividualStatuses(initialStatuses);
    } else if (allAttendees.length === 1) {
      // setSelectedStatus(allAttendees[0].meeting_status || '');
    }
  }, [selectedMeetings]);

  const renderStatusSelects = () => {
    if (selectedNames.length > 1) {
      return Object.entries(individualStatuses).map(([studentName, status]) => (
        <div key={studentName} className="flex flex-column gap-4">
          <div className="flex gap-4">
            <div className="multi-attendee-name">{studentName}</div>
            <FormControl className="w-12">
              <InputLabel id="demo-simple-select-label">
                Meeting Status
              </InputLabel>
              <Select
                value={status}
                onChange={(e) =>
                  handleIndividualStatusChange(studentName, e.target.value)
                }>
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      ));
    } else {
      return (
        <FormControl className="w-12">
          <InputLabel id="demo-simple-select-label">Meeting Status</InputLabel>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            // ... other props
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
  };

  const handleIndividualStatusChange = (
    studentName: string,
    status: string
  ) => {
    setIndividualStatuses((prev) => ({ ...prev, [studentName]: status }));
  };

  const isMetStatusPresent = () => {
    return Object.values(individualStatuses).some((status) => status === 'Met');
  };

  // Use this function to disable or enable the Program and Level/Lesson fields
  const isEditable = isMetStatusPresent();

  /* -------------------------------------------------------------------------- */
  /*                               Program Options                               */
  /* -------------------------------------------------------------------------- */

  const programOptions: string[] = ['Barton', 'Connections', 'Foundations'];

  const programs = [...programOptions];

  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const handleProgramChange = (event: SelectChangeEvent) => {
    const selectedProgram = event.target.value; // selected id
    setFormValues({ ...formValues, program: selectedProgram });
    setSelectedProgram(selectedProgram);
  };

  /* -------------------------------------------------------------------------- */
  /*                           HANDLE SELECTED MEETING                          */
  /* -------------------------------------------------------------------------- */

  const allStudentNames = getStudentsBySchool.map((student) => {
    const firstName = student?.first_name ?? '';
    const lastName = student?.last_name ?? '';

    return `${firstName} ${lastName}`;
  });
  useEffect(() => {
    setStudentNames(allStudentNames);
  }, [allStudentNames]);

  // Update the selectedMeetings value anytime a checkbox is checked.

  useEffect(() => {
    const getAttendeeNames = (): string[] => {
      return selectedMeetings.flatMap((meeting) =>
        meeting.attendees.map((attendee) => attendee.name)
      );
    };
    const names = getAttendeeNames();
    setName(names);
    setSelectedNames(names); // Assuming you want to pre-select these names
  }, [selectedMeetings]);

  useEffect(() => {
    // Let's say we want to log the new meetings count every time it changes
    console.log(`Number of formdates updated: ${getDatedMeetings.length}`);
  }, [meetings]);

  useEffect(() => {
    if (selectedMeetings.length > 0 && selectedMeetings[0]?.attendees) {
      const selectedMeeting = selectedMeetings[0];
      if (!selectedMeeting) return;
      // const attendeeNames = selectedMeetings[0].attendees.map(
      //   (attendee) => attendee.name
      // );
      // setSelectedNames(attendeeNames);

      const newStatuses: { [key: string]: string } = {}; // Define the type explicitly
      selectedMeetings[0].attendees.forEach((attendee) => {
        newStatuses[attendee.name] = attendee.meeting_status || '';
      });
      setIndividualStatuses(newStatuses);

      // Determine if form is editable
      const metStatusPresent = Object.values(newStatuses).some(
        (status) => status === 'Met'
      );
      setIsFormEditable(metStatusPresent);

      const attendeeNames = attendees.map((attendee) => {
        const student = getStudentsBySchool.find(
          (s) => s.id === attendee.student_id
        );
        const firstName = student?.first_name ?? '';
        const lastName = student?.last_name ?? '';

        const name = `${firstName} ${lastName}`;
        setName((prevNames) => [...prevNames, ...name]);
        return name;
      });

      setNamesForSelect(
        typeof attendeeNames === 'string' ? [attendeeNames] : attendeeNames
      );

      // const name = 'Johnny Doe';
      setFormDate(dayjs(selectedMeeting.start));
      const start = dayjs(selectedMeeting.start);
      const end = dayjs(selectedMeeting.end);
      setStartTime(start);
      setEndTime(end);
      const meeting_status =
        selectedMeeting?.attendees[0]?.meeting_status ?? '';
      setSelectedStatus(meeting_status);
      setFormValues({
        name: namesForSelect,
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
  }, [attendees, getStudentsBySchool, namesForSelect, selectedMeetings]);

  // Update the selectedMeetings value anytime a checkbox is unchecked.
  useEffect(() => {
    if (selectedMeetings.length <= 0) {
      setFormValues({
        // name: '',
        name: [],
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
      // setName('');
      setName([]);
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
      recorded_by: sessionData?.userId.toString() ?? '',
      recorded_on: dayjs().toDate(),
      attendees: [],
    };
    createMeetingMutation.mutate(newMeeting);

    // setName('');
    setName([]);
    setSelectedStatus('');
    setStartTime(dayjs());
    setEndTime(dayjs());

    setFormValues({
      // name: '',
      name: [],
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

  useEffect(() => {
    if (createMeetingMutation.isSuccess) {
      toast.current?.show({
        severity: 'success',
        summary: 'This meeting has been added.',
        life: 3000,
      });
    }
  }, [createMeetingMutation.isSuccess]);

  useEffect(() => {
    if (createMeetingMutation.isError) {
      toast.current?.show({
        severity: 'error',
        summary: 'There was an error, and this meeting was not added.',
        life: 3000,
      });
    }
  }, [createMeetingMutation.isError]);

  /* ------------------- edit Meeting ------------------- */
  const editMeetingMutation = api.meetings.editMeeting.useMutation();

  // const editMeeting = (formValues: FormValues) => {
  //   if (!selectedMeetings) {
  //     return;
  //   }
  //   const id = selectedMeetings[0]?.id as number;

  //   const editedMeeting = {
  //     id: id,
  //     name: name,
  //     student_id: formValues.student_id ?? 0,
  //     start: dayjs(start).toDate(),
  //     end: dayjs(end).toDate(),
  //     meeting_status: formValues.meeting_status,
  //     program: formValues.program ?? '',
  //     level_lesson: formValues.level_lesson ?? '',
  //     meeting_notes: formValues.meeting_notes ?? '',
  //     edited_by: 'sarah',
  //     edited_on: dayjs().toDate(),
  //   };
  //   editMeetingMutation.mutate(editedMeeting);
  // };

  const editMeeting = async (formValues: FormValues) => {
    if (!selectedMeetings.length) {
      return;
    }

    try {
      // Prepare meeting data
      const meetingData = {
        id: selectedMeetings[0]?.id as number,
        start: formValues.start?.toDate() ?? new Date(),
        end: formValues.end?.toDate() ?? new Date(),
        program: formValues.program ?? '',
        level_lesson: formValues.level_lesson ?? '',
        meeting_notes: formValues.meeting_notes ?? '',
        edited_by: sessionData?.userId.toString() ?? '',
        edited_on: new Date(),
        attendees: selectedNames.map((name) => {
          const attendeeStatus = individualStatuses[name];
          const studentId =
            getStudentsBySchool.find(
              (student) =>
                `${student.first_name ?? ''} ${student.last_name ?? ''}` ===
                name
            )?.id ?? 0;
          return {
            student_id: studentId,
            meeting_status: attendeeStatus,
          };
        }),
      };

      // Call the tRPC mutation
      const response = await editMeetingMutation.mutateAsync(meetingData);

      if (response.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Meeting successfully updated.',
          life: 3000,
        });

        // Update meetings list if necessary
        // ... your logic to update meetings list
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error updating meeting.',
        life: 3000,
      });
    }
  };

  useEffect(() => {
    if (editMeetingMutation.isSuccess) {
      toast.current?.show({
        severity: 'success',
        summary: 'This meeting has been saved.',
        life: 3000,
      });
      setMeetings(meetings);
    }
  }, [editMeetingMutation.isSuccess]);

  useEffect(() => {
    if (editMeetingMutation.isError) {
      toast.current?.show({
        severity: 'error',
        summary: 'There was an error, and this meeting was not saved.',
        life: 3000,
      });
    }
  }, [editMeetingMutation.isError]);

  /* ------------------------------ DELETEMEETING ----------------------------- */

  const deleteMeetingMutation = api.meetings.deleteMeeting.useMutation();

  const handleDelete = () => {
    const id = Number(selectedMeetings[0]?.id);
    // const confirm = window.confirm(
    //   'Are you sure you want to delete this meeting?'
    // );
    // if (!confirm) return;

    toastDelete.current?.show({
      severity: 'error',
      summary: 'Delete Meeting',
      sticky: true,
      content: (
        <div
          className="flex flex-column align-items-center"
          style={{ flex: '1' }}>
          <div className="text-center">
            <i
              className="pi pi-exclamation-triangle"
              style={{ fontSize: '3rem' }}></i>
            <div className="font-bold text-xl my-3">
              Are you sure you want to delete this meeting?
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                try {
                  deleteMeetingMutation.mutate({ id: id });
                } catch (error) {
                  console.error(`Error deleting this meeeting.`);
                }

                if (deleteMeetingMutation.isSuccess) {
                  toast.current?.show({
                    severity: 'success',
                    summary: 'This meeting has been deleted.',
                    life: 3000,
                  });
                  // setName('');
                  setName([]);
                  setSelectedStatus('');
                  setStartTime(dayjs());
                  setEndTime(dayjs());

                  setFormValues({
                    id: 0,
                    // name: '',
                    name: [],
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
              color="error">
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

  const [isFormEditable, setIsFormEditable] = useState(false);

  // useEffect(() => {
  //   const metStatusPresent = Object.values(individualStatuses).some(
  //     (status) => status === 'Met'
  //   );
  //   setIsFormEditable(metStatusPresent);
  // }, [individualStatuses, selectedMeetings]);

  /* ------------------------------------------------------------- */
  /*                           HTML RETURN                         */
  /* ------------------------------------------------------------- */

  return (
    <Card className="lg:w-5 flex-order-2 lg:flex-order-1 card">
      <Toast ref={toast} />
      <Toast ref={toastDelete} position="top-center" />
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
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={selectedNames}
              onChange={handleNameChange}
              input={<OutlinedInput label="Tag" />}
              renderValue={(selected) => selected.join(', ')}>
              {studentNames.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={selectedNames.includes(name)} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              className="w-12"
              value={formDate}
              onChange={handleFormDateChange}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex gap-4">
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={handleStartTime}
                className="w-6"
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={handleEndTime}
                className="w-6"
              />
            </div>
          </LocalizationProvider>
          {renderStatusSelects()}
          <div className="flex gap-4">
            <FormControl className="w-6">
              <InputLabel id="demo-simple-select-label">Program</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={formValues.program ? formValues.program : ''}
                label="Program"
                disabled={!isFormEditable}
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
              disabled={!isFormEditable}
              onChange={(e) =>
                setFormValues({ ...formValues, level_lesson: e.target.value })
              }
              label="Level/Lesson"
              className="w-6"
            />
          </div>
          <TextField
            id="outlined-multiline-flexible"
            value={formValues.meeting_notes}
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
                const action = existingMeeting
                  ? Promise.resolve(editMeeting(formValues))
                  : Promise.resolve(handleAdd(formValues));
                action
                  .then(() => {
                    // Handle successful response here, if needed
                  })
                  .catch((error) => {
                    // Handle error here
                    console.error('Error in action:', error);
                  });
              }}>
              {existingMeeting ? 'Save' : 'Add'}
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
