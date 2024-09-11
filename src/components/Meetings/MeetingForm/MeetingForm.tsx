import React, { useEffect, useState, useRef, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Card } from "primereact/card";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { api } from "@/utils/api";
import { Toast } from "primereact/toast";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import type {
  Student,
  MeetingAttendees,
  FormValues,
  MeetingWithAttendees,
  // Meeting,
} from "@/types";
import { OutlinedInput } from "@mui/material";
import { useSession } from "next-auth/react";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

/* -------------------------------------------------------------------------- */
/*                         Interfacing for TypeScript                         */
/* -------------------------------------------------------------------------- */

interface NewMeetingValues {
  start: Date;
  end: Date;
  program: string;
  level_lesson: string;
  meeting_notes: string;
  recorded_by: string;
  recorded_on: Date;
  tutor_id: number;
  attendees: {
    student_id: number;
    meeting_status?: string;
    created_at: Date;
    name: string;
  }[];
}

interface UpdatedMeetingValues {
  id: number;
  start: Date;
  end: Date;
  program: string;
  level_lesson: string;
  meeting_notes: string;
  edited_by: string;
  edited_on: Date;
  tutor_id: number;
  attendees: {
    student_id: number;
    meeting_status?: string;
    name: string;
  }[];
}

interface Props {
  meetings: MeetingWithAttendees[];
  setAllMeetings: (meetings: MeetingWithAttendees[] | ((prevMeetings: MeetingWithAttendees[]) => MeetingWithAttendees[])) => void;
  setMeetings: (meetings: MeetingWithAttendees[] | ((prevMeetings: MeetingWithAttendees[]) => MeetingWithAttendees[])) => void;
  students: Student[];
  myDatedMeetings: MeetingWithAttendees[];
  setMyDatedMeetings: (myDatedMeetings: MeetingWithAttendees[] | ((prevMeetings: MeetingWithAttendees[]) => MeetingWithAttendees[])) => void;
  selectedMeetings: MeetingWithAttendees[];
  setSelectedMeetings: (meetings: MeetingWithAttendees[]) => void;
  selectedMeetingAttendees: MeetingAttendees[];
  selectedDate: Dayjs;
  datedMeetingsWithAttendees: MeetingWithAttendees[];
  setDatedMeetingsWithAttendees: (meetings: MeetingWithAttendees[]) => void;
  isOnMeetingsPage: boolean;
  isOnStudentsPage: boolean;
}

const MeetingForm: React.FC<Props> = ({
  meetings,
  setAllMeetings,
  setMeetings,
  students = [],
  myDatedMeetings = [],
  setMyDatedMeetings,
  selectedMeetings = [],
  setSelectedMeetings,
  selectedDate,
  setDatedMeetingsWithAttendees,
  isOnMeetingsPage,
  isOnStudentsPage,
}) => {
  const { data: session } = useSession();
  const sessionData = session?.user;

  const toast = useRef<Toast>(null);
  const toastDelete = useRef<Toast>(null);

  const [attendees, setAttendees] = useState<MeetingAttendees[]>([]);
  const [formDate, setFormDate] = useState(selectedDate);
  const [isFormEditable, setIsFormEditable] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: [],
    student_id: 0,
    start: dayjs(),
    end: dayjs(),
    meeting_status: "",
    program: "",
    level_lesson: "",
    meeting_notes: "",
    recorded_by: "",
    recorded_on: dayjs(),
    edited_by: "",
    edited_on: dayjs(),
    attendees: [],
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [name, setName] = useState<string[]>([]);
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [namesForSelect, setNamesForSelect] = useState<string[]>([]);
  const [removedAttendees, setRemovedAttendees] = useState<number[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<MeetingAttendees[]>([]);
  const [startTime, setStartTime] = useState<Dayjs>(dayjs());
  const [endTime, setEndTime] = useState<Dayjs>(dayjs());
  const [individualStatuses, setIndividualStatuses] = useState<{ [key: string]: string }>({});
  // const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  // Add this state for program options
  const [programOptions, setProgramOptions] = useState<string[]>([]);

  // Create a query to fetch program options
  const { data: getProgramOptions } = api.appSettings.getProgramOptions.useQuery() as { data: string[] | undefined };


  // Use an effect to update the programOptions state when data is fetched
  useEffect(() => {
    if (getProgramOptions) {
      setProgramOptions(getProgramOptions);
    }
  }, [getProgramOptions]);

  const checkFormValidity = () => {
    const isNameValid = selectedNames.length > 0;
    const isDateValid = !!formDate;
    const isTimeValid = !!startTime && !!endTime;
    const isStatusValid = selectedNames.every(name => individualStatuses[name]);
    const isProgramValid = formValues.program !== "" || !isFormEditable;

    const isValid = isNameValid && isDateValid && isTimeValid && isStatusValid && isProgramValid;

      console.log('Form validity:', isValid);

    setIsFormValid(isValid);
  };

  // useEffect(() => {
  //   checkFormValidity();
  // }, [selectedNames, formDate, startTime, endTime, individualStatuses, formValues.program, isFormEditable]);

  useEffect(() => {
    if (selectedDate && myDatedMeetings) {
      const datedMeetingsWithAttendees: MeetingWithAttendees[] =
        myDatedMeetings.map((meeting): MeetingWithAttendees => {
          const attendees = (meeting.MeetingAttendees ?? [])
            .map((attendee) => {
              const student = students?.find(
                (s) => s.id === attendee.student_id
              );
              if (!student) return;
              return {
                ...attendee,
                id: attendee.student_id,
                name: `${student.first_name ?? ""} ${student.last_name ?? ""}`,
              };
            })
            .filter(
              (
                a
              ): a is {
                id: number;
                meeting_id: number;
                student_id: number;
                meeting_status: string;
                created_at: Dayjs;
                name: string;
              } => Boolean(a)
            ) as {
            id: number;
            meeting_id: number;
            student_id: number;
            meeting_status: string;
            created_at: Dayjs;
            name: string;
          }[];
          return { ...meeting, attendees };
        });
      setDatedMeetingsWithAttendees(datedMeetingsWithAttendees);
    }
  }, [
    myDatedMeetings,
    meetings,
    students,
    selectedDate,
    setDatedMeetingsWithAttendees,
  ]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => {
      const updatedFormValues = { ...prevFormValues, [name]: value };
      checkFormValidity();
      return updatedFormValues;
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                             HANDLE NAME CHANGE                             */
  /* -------------------------------------------------------------------------- */

  const meeting_id = selectedMeetings[0]?.id ?? 0;
  const { data: mySelectedAttendees } =
    api.meetings.getAttendeesByMeeting.useQuery({ meeting_id }) as {
      data: MeetingAttendees[];
    };

  useEffect(() => {
    if (mySelectedAttendees) {
      setSelectedAttendees(mySelectedAttendees);
    }
  }, [mySelectedAttendees, selectedMeetings]);

  const handleNameChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const newSelectedNames =
      typeof value === "string" ? value.split(",") : value;

    // Function to get name by student ID
    const getNameById = (studentId: number): string => {
      const student = students.find((s) => s.id === studentId);
      return student
        ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
        : "";
    };

    // Map names to their corresponding student IDs
    const nameToStudentIdMap = new Map<string, number>();
    students.forEach((student) => {
      if (student.id !== undefined) {
        const name = getNameById(student.id);
        nameToStudentIdMap.set(name, student.id);
      }
    });

    // Determine newly removed attendee IDs based on selectedAttendees
    const newlyRemovedAttendeeIds = selectedAttendees
      .filter(({ student_id }) => {
        if (student_id === undefined) return false;
        return !newSelectedNames.includes(getNameById(student_id));
      })
      .map(({ id }) => id ?? -1) // Use -1 or a suitable placeholder for undefined ID
      .filter((id) => id !== -1); // Filter out the placeholders

    // Determine re-added attendee IDs
    const reAddedAttendeeIds = removedAttendees.filter((attendeeId) =>
      newSelectedNames.some((name) =>
        selectedAttendees.find(
          ({ id, student_id }) =>
            id === attendeeId && nameToStudentIdMap.get(name) === student_id
        )
      )
    );

    // Update removedAttendees
    const updatedRemovedAttendees = [
      ...removedAttendees.filter((id) => !reAddedAttendeeIds.includes(id)),
      ...newlyRemovedAttendeeIds,
    ];

    setSelectedNames(newSelectedNames);
    setRemovedAttendees(updatedRemovedAttendees);
    checkFormValidity();
  };

  /* -------------------------------------------------------------------------- */
  /*                            HANDLE DATE AND TIME                            */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    setFormDate(selectedDate);
  }, [selectedDate]);

  const handleFormDateChange = (date: Dayjs | null) => {
    if (date) {
      // Convert the Dayjs date object to start and end times with Date type
      const startDateTime = date
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(startTime.second())
        .millisecond(startTime.millisecond());

      const endDateTime = date
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(endTime.second())
        .millisecond(endTime.millisecond());

      // Update the form date and form values for start and end with Date objects
      setFormDate(date);
      setFormValues({
        ...formValues,
        start: startDateTime, // Now a Date object
        end: endDateTime, // Now a Date object
      });
      checkFormValidity();
    }
  };

  const handleStartTime = (time: Dayjs | null) => {
    if (time) {
      setStartTime(time); // Update the startTime state directly with the Dayjs object

      // Combine the date from the formDate state and the time from the timepicker
      const updatedStart = time
        .set("year", dateFromForm?.year())
        .set("month", dateFromForm?.month())
        .set("date", dateFromForm?.date());

      setFormValues({ ...formValues, start: updatedStart });
      checkFormValidity();
    }
  };
  const handleEndTime = (time: Dayjs | null) => {
    if (time) {
      setEndTime(time); // Update the endTime state directly with the Dayjs object

      // Combine the date from the formDate state and the time from the timepicker
      const updatedEnd = time
        .set("year", dateFromForm?.year())
        .set("month", dateFromForm?.month())
        .set("date", dateFromForm?.date());

      setFormValues({ ...formValues, end: updatedEnd });
      checkFormValidity();
    }
  };

  const startTimeToString = startTime.format("HH:mm:ss");
  const endTimeToString = endTime.format("HH:mm:ss");

  const dateFromForm = formDate || dayjs();
  const startDateTime = `${dayjs(dateFromForm?.toDate()).format(
    "YYYY-MM-DD"
  )}T${startTimeToString}`;
  const endDateTime = `${dayjs(dateFromForm?.toDate()).format(
    "YYYY-MM-DD"
  )}T${endTimeToString}`;

  const start = startDateTime;
  const end = endDateTime;

  /* -------------------------------------------------------------------------- */
  /*                               Status Options                               */
  /* -------------------------------------------------------------------------- */

  const statusOptions: string[] = [
    "Met",
    "Student Unavailable",
    "Tutor Unavailable",
    "Student Absent",
    "Tutor Absent",
  ];

  const options = [...statusOptions];

  useEffect(() => {
    const allAttendees = selectedMeetings.flatMap(meeting => meeting.attendees);
    const initialStatuses = allAttendees.reduce((acc, attendee) => {
      if (attendee?.name) {
        acc[attendee.name] = attendee.meeting_status || "";
      }
      return acc;
    }, {} as { [key: string]: string });
    setIndividualStatuses(initialStatuses);
  }, [selectedMeetings]);

  const renderStatusSelects = () => {
    return selectedNames.map((studentName) => {
      const status = individualStatuses[studentName] || "";
      return (
        <div key={studentName} className="flex flex-column gap-4">
          <div className="flex gap-4">
            {selectedNames.length > 1 && <div className="multi-attendee-name">{studentName}</div>}
            <FormControl className="w-12">
              <InputLabel id="demo-simple-select-label">Meeting Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => handleIndividualStatusChange(studentName, e.target.value)}
                inputProps={{
                  readOnly: !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Tutor"].includes(role)),
                }}
              >
                {options.sort().map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    const anyMetStatus = Object.values(individualStatuses).some(status => status === "Met");
    setIsFormEditable(anyMetStatus);
  }, [individualStatuses]);

  const handleIndividualStatusChange = (
    studentName: string,
    status: string
  ) => {
    setIndividualStatuses(prev => {
      const newStatuses = { ...prev, [studentName]: status };
      checkFormValidity();
      return newStatuses;
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                               Program Options                               */
  /* -------------------------------------------------------------------------- */


  const handleProgramChange = (event: SelectChangeEvent) => {
    const selectedProgram = event.target.value;
    setFormValues({ ...formValues, program: selectedProgram });
    setSelectedProgram(selectedProgram);
    checkFormValidity();
  };

  /* -------------------------------------------------------------------------- */
  /*                           HANDLE SELECTED MEETING                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (isOnMeetingsPage) {
      const filteredStudents = students.filter(
        (student) =>
          student.tutor_id === session?.user?.userId &&
          !student.withdrew &&
          !student.moved &&
          !student.graduated
      );
      const allStudentNames = filteredStudents.sort().map((student) => {
        const firstName = student?.first_name ?? "";
        const lastName = student?.last_name ?? "";

        return `${firstName} ${lastName}`;
      });
      setStudentNames(allStudentNames);
    }
    if (isOnStudentsPage) {
      const allStudentNames = students.sort().map((student) => {
        const firstName = student?.first_name ?? "";
        const lastName = student?.last_name ?? "";

        return `${firstName} ${lastName}`;
      });
      setStudentNames(allStudentNames);
    }
  }, [students, isOnMeetingsPage, isOnStudentsPage]);

  // useEffect(() => {
  //   const getAttendeeNames = (): string[] => {
  //     return selectedMeetings.flatMap(
  //       (meeting) =>
  //         meeting?.attendees?.sort().map((attendee) => attendee.name) ?? []
  //     );
  //   };
  //   const names = getAttendeeNames();
  //   setName(names);
  //   setSelectedNames(names);
  // }, [selectedMeetings]);

  useEffect(() => {
    if (selectedMeetings.length > 0) {
      const selectedMeeting = selectedMeetings[0];
      if (!selectedMeeting) return;
      console.log('selectedMeeting', selectedMeeting)

      const newStatuses: { [key: string]: string } = {};
      selectedMeeting.attendees?.forEach((attendee) => {
        newStatuses[attendee.name] = attendee.meeting_status || "";
      });
      setIndividualStatuses(newStatuses);
      console.log('newStatuses', newStatuses)

      const metStatusPresent = Object.values(newStatuses).some(
        (status) => status === "Met"
      );
      setIsFormEditable(metStatusPresent);
      console.log('isFormEditable', isFormEditable)

      const attendeeNames =
        selectedMeeting.attendees?.map((attendee) => {
          const student = students.find((s) => s.id === attendee.student_id);
          const firstName = student?.first_name ?? "";
          const lastName = student?.last_name ?? "";

          return `${firstName} ${lastName}`;
        }) || [];

      console.log('attendeeNames', attendeeNames)

      setName((prevNames) => [...prevNames, ...attendeeNames]);
      setSelectedNames(attendeeNames);
      setNamesForSelect(attendeeNames);
      console.log('namesForSelect', namesForSelect)
      
      setFormDate(dayjs(selectedMeeting.start));
      const start = dayjs(selectedMeeting.start);
      const end = dayjs(selectedMeeting.end);
      setStartTime(start);
      setEndTime(end);
      const meeting_status =
        selectedMeeting.attendees?.[0]?.meeting_status ?? "";
      setIndividualStatuses(newStatuses);
      // setSelectedStatus(meeting_status);
      setFormValues({
        name: attendeeNames,
        student_id: 0,
        start: dayjs(start),
        end: dayjs(end),
        meeting_status: meeting_status || "",
        program: selectedMeeting.program || "",
        level_lesson: selectedMeeting.level_lesson || "",
        meeting_notes: selectedMeeting.meeting_notes || "",
        recorded_by: "",
        recorded_on: dayjs.utc(),
        edited_by: "",
        edited_on: dayjs.utc(),
        attendees: selectedMeeting.attendees ?? [],
      });
    }
  }, [selectedMeetings]);

  useEffect(() => {
    if (selectedMeetings.length <= 0) {
      setFormValues({
        name: [],
        student_id: 0,
        start: dayjs(),
        end: dayjs(),
        meeting_status: "",
        program: "",
        level_lesson: "",
        meeting_notes: "",
        recorded_by: "",
        recorded_on: dayjs.utc(),
        edited_by: "",
        edited_on: dayjs.utc(),
        attendees: [],
      });
      setName([]);
      setIndividualStatuses({});
      // setSelectedStatus("");
      setStartTime(dayjs());
      setEndTime(dayjs());
    }
  }, [selectedMeetings]);

  /* -------------------------------------------------------------------------- */
  /*                                Form Controls                               */
  /* -------------------------------------------------------------------------- */

  /* ------------------- create Meeting ------------------- */
  const updateAttendees = () => {
    const updatedAttendees: MeetingAttendees[] = selectedNames.map((name) => {
      const student = students.find(
        (s) => `${s.first_name || ""} ${s.last_name || ""}` === name
      );
      const studentId = student ? student.id : undefined;
      const meetingStatus = individualStatuses[name] || "";

      return {
        student_id: studentId,
        meeting_status: meetingStatus,
      };
    });

    setFormValues((prevValues) => ({
      ...prevValues,
      attendees: updatedAttendees,
    }));
  };

  useEffect(() => {
    updateAttendees();
  }, [selectedNames, individualStatuses, students]);

  const createMeetingMutation = api.meetings.createMeeting.useMutation();

  useEffect(() => {
    if (!formValues.attendees) return;
    const getAttendees = formValues.attendees?.map((attendee) => ({
      student_id: attendee.student_id,
      meeting_status: attendee.meeting_status,
      created_at: dayjs.utc().toDate(),
    }));
    setAttendees(getAttendees);
  }, [formValues.attendees]);

  const handleAdd = (formValues: FormValues) => {
    if(!isFormValid) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Please fill out all required fields." });
      return;
    }
    const validAttendees = attendees
      .filter((attendee) => attendee.student_id !== undefined)
      .map((attendee) => ({
        student_id: attendee.student_id as number,
        meeting_status: attendee.meeting_status || "",
        created_at: dayjs.utc().toDate(),
        name: `${
          students.find((s) => s.id === attendee.student_id)?.first_name || ""
        } ${
          students.find((s) => s.id === attendee.student_id)?.last_name || ""
        }`,
      }));
  
    const newMeeting: NewMeetingValues = {
      start: dayjs(start).toDate(),
      end: dayjs(end).toDate(),
      program: formValues.program ?? "",
      level_lesson: formValues.level_lesson ?? "",
      meeting_notes: formValues.meeting_notes ?? "",
      recorded_by: sessionData?.userId.toString() ?? "",
      recorded_on: dayjs.utc().toDate(),
      tutor_id: sessionData?.userId || 0,
      attendees: validAttendees,
    };

    createMeetingMutation.mutate(newMeeting, {
      onSuccess: (response) => {
        if (response && response.success) {
          // const newMeeting = response.meeting;
          const newMeetingWithAttendees: MeetingWithAttendees = {
            ...response.meeting,
            MeetingAttendees: validAttendees // Use the attendees you already have
          };

          setMyDatedMeetings((prevMeetings: MeetingWithAttendees[]) => {
            const updatedMeetings = [...prevMeetings, newMeetingWithAttendees];
            return updatedMeetings;
          });
          setAllMeetings((prevMeetings: MeetingWithAttendees[]) => [...prevMeetings, newMeetingWithAttendees]);

          toast.current?.show({
            severity: "success",
            summary: "Meeting successfully added.",
            life: 3000,
          });

          setFormValues({
            name: [],
            student_id: 0,
            start: dayjs(),
            end: dayjs(),
            meeting_status: "",
            program: "",
            level_lesson: "",
            meeting_notes: "",
            recorded_by: "",
            recorded_on: dayjs.utc(),
            edited_by: "",
            edited_on: dayjs.utc(),
            attendees: [],
          });

          setName([]);
          setSelectedNames([]);
          setIndividualStatuses({});
          // setSelectedStatus("");
          setStartTime(dayjs());
          setEndTime(dayjs());
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      onError: (error) => {
        console.error("Error adding meeting:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error adding meeting.",
          life: 3000,
        });
      },
    });
  };

  /* ------------------- edit Meeting ------------------- */
  const updateMeetingMutation = api.meetings.updateMeeting.useMutation();
  const removeAttendees = api.meetings.deleteAttendeesInput.useMutation();

  const editMeeting = (formValues: FormValues) => {
    if (!selectedMeetings.length) {
      return;
    }

    if (!isFormValid) {
      toast.current?.show({
        severity: "error",
        summary: "Form is not valid",
        detail: "Please fill in all required fields.",
      });
      return;
    }

    const meetingData: UpdatedMeetingValues = {
      ...formValues,
      id: selectedMeetings[0]?.id as number,
      start: formValues.start?.toDate() ?? new Date(),
      end: formValues.end?.toDate() ?? new Date(),
      program: formValues.program ?? "",
      level_lesson: formValues.level_lesson ?? "",
      meeting_notes: formValues.meeting_notes ?? "",
      edited_by: sessionData?.userId.toString() ?? "",
      edited_on: new Date(),
      tutor_id: sessionData?.userId || 0,
      attendees: selectedNames.map((name) => {
        const attendeeStatus = individualStatuses[name];
        const studentId =
          students.find(
            (student) =>
              `${student.first_name ?? ""} ${student.last_name ?? ""}` === name
          )?.id ?? 0;
        return {
          student_id: studentId,
          meeting_status: attendeeStatus,
          name: name,
        };
      }),
    };
    // Use removedAttendees as is, since it's already an array of numbers
    const attendeeIdsToRemove = {
      attendeeIds: removedAttendees,
    };
    // Make an API call to delete the removed attendees
    if (removedAttendees.length > 0) {
      removeAttendees.mutate(attendeeIdsToRemove, {
        onSuccess: () => {
          console.log("Attendees deleted successfully");
          // Update your state/UI as necessary
        },
        onError: (error) => {
          console.error("Error deleting attendees:", error);
        },
      });
    }

    updateMeetingMutation.mutate(meetingData, {
      onSuccess: (response) => {
        if (response && response.success) {
          setMyDatedMeetings((prevMeetings: MeetingWithAttendees[]) => {
            return prevMeetings.map((meeting) => 
              meeting.id === meetingData.id 
                ? {
                    ...meeting,
                    ...meetingData,
                    MeetingAttendees: meetingData.attendees.map(att => ({
                      student_id: att.student_id,
                      meeting_status: att.meeting_status || "",
                      name: `${students.find(s => s.id === att.student_id)?.first_name ?? ""} ${
                              students.find(s => s.id === att.student_id)?.last_name ?? ""
                            }`,
                    }))
                  }
                : meeting
            );
          });
          setAllMeetings((prevMeetings: MeetingWithAttendees[]) => {
            return prevMeetings.map((meeting) => 
              meeting.id === meetingData.id 
                ? {
                    ...meeting,
                    ...meetingData,
                    MeetingAttendees: meetingData.attendees.map(att => ({
                      student_id: att.student_id,
                      meeting_status: att.meeting_status || "",
                      name: `${students.find(s => s.id === att.student_id)?.first_name ?? ""} ${
                              students.find(s => s.id === att.student_id)?.last_name ?? ""
                            }`,
                    }))
                  }
                : meeting
            );
          });
          setSelectedMeetings([]);
          toast.current?.show({
            severity: "success",
            summary: "Meeting successfully updated.",
            life: 3000,
          });
        }
      },
      onError: (error) => {
        console.error("Error updating meeting:", error);
        toast.current?.show({
          severity: "error",
          summary: "Error updating meeting.",
          life: 3000,
        });
      },
    });
          };

  /* ------------------------------ DELETEMEETING ----------------------------- */

  const deleteMeetingMutation = api.meetings.deleteMeeting.useMutation();

  const handleDelete = () => {
    const id = Number(selectedMeetings[0]?.id);

    toastDelete.current?.show({
      severity: "error",
      summary: "Delete Meeting",
      sticky: true,
      content: (
        <div
          className="flex flex-column align-items-center"
          style={{ flex: "1" }}
        >
          <div className="text-center">
            <i
              className="pi pi-exclamation-triangle"
              style={{ fontSize: "3rem" }}
            ></i>
            <div className="font-bold text-xl my-3">
              Are you sure you want to delete this meeting?
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                deleteMeetingMutation.mutate(
                  { id: id },
                  {
                    onSuccess: (response) => {
                      if (response) {
                        toastDelete.current?.clear();
                        const updatedMeetings = meetings.filter(
                          (meeting) => meeting.id !== id
                        );
                        setMeetings(updatedMeetings);
                        const myUpdatedMeetings = myDatedMeetings.filter(
                          (meeting) => meeting.id !== id
                        );
                        setMyDatedMeetings(myUpdatedMeetings);
                        setAllMeetings((prevMeetings: MeetingWithAttendees[]) => prevMeetings.filter(meeting => meeting.id !== id));

                        toast.current?.show({
                          severity: "success",
                          summary: "This meeting has been deleted.",
                          life: 3000,
                        });
                        setFormValues({
                          name: [],
                          student_id: 0,
                          start: dayjs(),
                          end: dayjs(),
                          meeting_status: "",
                          program: "",
                          level_lesson: "",
                          meeting_notes: "",
                          recorded_by: "",
                          recorded_on: dayjs.utc(),
                          edited_by: "",
                          edited_on: dayjs.utc(),
                          attendees: [],
                        });
                        setName([]);
                        setSelectedNames([]);
                        setIndividualStatuses({});
                        // setSelectedStatus("");
                        setStartTime(dayjs());
                        setEndTime(dayjs());

                        // location.reload();
                      }
                    },
                    onError: () => {
                      // This code runs if the mutation fails
                      toast.current?.show({
                        severity: "error",
                        summary:
                          "There was an error, and this meeting was not deleted.",
                        life: 3000,
                      });
                    },
                  }
                );
              }}
              variant="contained"
              color="error"
            >
              Confirm
            </Button>
            <Button
              onClick={() => toastDelete.current?.clear()}
              variant="contained"
              color="secondary"
            >
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

  const existingMeeting = selectedMeetings.length > 0;

  const noMeeting =
    selectedMeetings.length <= 0 || selectedMeetings.length === undefined;

  let hiddenButtonClass = "hidden"; // Default to hidden

  if (isOnMeetingsPage && session?.user.role) {
    const roles = session?.user?.role
      ?.split(",")
      .sort()
      .map((role) => role.trim());
    if (roles.includes("Admin") || roles.includes("Tutor")) {
      hiddenButtonClass = "";
    } else {
      hiddenButtonClass = "hidden";
    }
  }

  if (isOnStudentsPage && session?.user.role) {
    const roles = session?.user?.role
      ?.split(",")
      .sort()
      .map((role) => role.trim());
    if (roles.includes("Admin")) {
      hiddenButtonClass = "";
    } else {
      hiddenButtonClass = "hidden";
    }
  }

  let hiddenFieldClass = "hidden"; // Default to hidden

  if (isOnMeetingsPage && session?.user.role) {
    const roles = session?.user?.role
      ?.split(",")
      .sort()
      .map((role) => role.trim());
    if (roles.includes("Tutor")) {
      hiddenFieldClass = "";
    } else {
      hiddenFieldClass = "hidden";
    }
  }

  if (isOnStudentsPage && session?.user.role) {
    const roles = session?.user?.role
      ?.split(",")
      .sort()
      .map((role) => role.trim());
    if (roles.includes("Admin")) {
      hiddenFieldClass = "";
    } else {
      hiddenFieldClass = "hidden";
    }
  }

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
            "& > :not(style)": { m: 0 },
          }}
          noValidate
          autoComplete="off"
          className="flex justify-content-center gap-4 flex-column"
        >
          <FormControl className="w-12">
            <InputLabel id="demo-simple-select-label">Name</InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={selectedNames}
              onChange={handleNameChange}
              input={<OutlinedInput label="Tag" />}
              renderValue={(selected) => selected.join(", ")}
              inputProps={{
                readOnly: !session?.user.role
                  .split(",")
                  .map((role) => role.trim())
                  .some((role) => ["Admin", "Tutor"].includes(role)),
              }}
            >
              {studentNames.sort().map((name) => (
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
              className={`w-12 ${hiddenFieldClass}`}
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
                readOnly={
                  !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Tutor"].includes(role))
                }
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={handleEndTime}
                className="w-6"
                readOnly={
                  !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Tutor"].includes(role))
                }
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
                value={formValues.program ? formValues.program : ""}
                label="Program"
                disabled={!isFormEditable}
                onChange={handleProgramChange}
                inputProps={{
                  readOnly: !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Tutor"].includes(role)),
                }}
              >
                {programOptions.sort().map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              // required
              // error={!formValues.level_lesson}
              name="level_lesson"
              id="outlined-multiline-flexible"
              value={formValues.level_lesson}
              disabled={!isFormEditable}
              onChange={handleTextChange}
              label="Level/Lesson"
              className="w-6"
              inputProps={{
                readOnly: !session?.user.role
                  .split(",")
                  .map((role) => role.trim())
                  .some((role) => ["Admin", "Tutor"].includes(role)),
              }}
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
            // Technically correct, but does it take into account multiple possible roles?
            inputProps={{
              readOnly: !session?.user.role
                .split(",")
                .map((role) => role.trim())
                .some((role) => ["Admin", "Tutor"].includes(role)),
            }}
          />
          <Stack direction="row" spacing={2} className={hiddenButtonClass}>
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
                    console.error("Error in action:", error);
                  });
              }}
              disabled={!isFormValid}
            >
              {existingMeeting ? "Save" : "Add"}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={noMeeting}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </div>
    </Card>
  );
};

export default MeetingForm;
