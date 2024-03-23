import React, { useEffect, useState, useRef } from "react";
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
} from "@/types";
import { OutlinedInput } from "@mui/material";
import { useSession } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*                         Interfacing for TypeScript                         */
/* -------------------------------------------------------------------------- */

interface Props {
  meetings: MeetingWithAttendees[];
  setMeetings: (meetings: MeetingWithAttendees[]) => void;
  students: Student[];
  getDatedMeetings: MeetingWithAttendees[];
  selectedMeetings: MeetingWithAttendees[];
  setSelectedMeetings: (meetings: MeetingWithAttendees[]) => void;
  isMeetingSelected: boolean;
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  datedMeetingsWithAttendees: MeetingWithAttendees[];
  setDatedMeetingsWithAttendees: (meetings: MeetingWithAttendees[]) => void;
  selectedMeetingAttendees: MeetingAttendees[];
  isOnMeetingsPage: boolean;
  isOnStudentsPage: boolean;
}

const MeetingForm: React.FC<Props> = ({
  meetings,
  setMeetings,
  students = [],
  getDatedMeetings = [],
  selectedMeetings = [],
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
  const [formValues, setFormValues] = useState<FormValues>({
    // name: '',
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

  useEffect(() => {
    console.log("meetings from MeetingForm", meetings);
    if (selectedDate && getDatedMeetings) {
      const datedMeetingsWithAttendees: MeetingWithAttendees[] =
        getDatedMeetings.map((meeting): MeetingWithAttendees => {
          // const students = getStudentsBySchool;
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
    // if (selectedDate && getDatedMeetings && isOnStudentsPage) {
    //   const datedMeetingsWithAttendees: MeetingWithAttendees[] =
    //     getDatedMeetings
    //       .map((meeting): MeetingWithAttendees => {
    //         const attendees = (meeting.MeetingAttendees ?? [])
    //           .map((attendee) => {
    //             const student = students?.find(
    //               (s) => s.id === attendee.student_id
    //             );
    //             if (!student) return;
    //             return {
    //               ...attendee,
    //               id: attendee.student_id,
    //               name: `${student.first_name ?? ""} ${
    //                 student.last_name ?? ""
    //               }`,
    //             };
    //           })
    //           .filter(
    //             (
    //               a
    //             ): a is {
    //               id: number;
    //               meeting_id: number;
    //               student_id: number;
    //               meeting_status: string;
    //               created_at: Dayjs;
    //               name: string;
    //             } => Boolean(a)
    //           );

    //         return { ...meeting, attendees };
    //       })
    //       // Here we filter the meetings to only include those with attendees that match the idOfStudent
    //       .filter((meeting) =>
    //         meeting.attendees?.some((attendee) => idOfStudent === attendee.id)
    //       );

    //   setDatedMeetingsWithAttendees(datedMeetingsWithAttendees);
    // }
  }, [
    getDatedMeetings,
    meetings,
    students,
    selectedDate,
    setDatedMeetingsWithAttendees,
  ]);

  /* -------------------------------------------------------------------------- */
  /*                             HANDLE NAME CHANGE                             */
  /* -------------------------------------------------------------------------- */

  const [name, setName] = React.useState<string[]>([]);
  const [studentNames, setStudentNames] = React.useState<string[]>([]);
  const [selectedNames, setSelectedNames] = React.useState<string[]>([]);
  const [namesForSelect, setNamesForSelect] = React.useState<string[]>([]);
  const [removedAttendees, setRemovedAttendees] = useState<number[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<
    MeetingAttendees[]
  >([]);

  const meeting_id = selectedMeetings[0]?.id ?? 0;
  const { data: mySelectedAttendees } =
    api.meetings.getAttendeesByMeeting.useQuery({ meeting_id }) as {
      data: MeetingAttendees[];
    };

  useEffect(() => {
    if (mySelectedAttendees) {
      setSelectedAttendees(mySelectedAttendees);
    }
  }, [selectedMeetings]);

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
  };

  // useEffect(() => {
  //   console.log("removedAttendees updated: ", removedAttendees);
  // }, [removedAttendees]);

  /* -------------------------------------------------------------------------- */
  /*                            HANDLE DATE AND TIME                            */
  /* -------------------------------------------------------------------------- */

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
  const [individualStatuses, setIndividualStatuses] = useState<{
    [key: string]: string;
  }>({});

  const statusOptions: string[] = [
    "Met",
    "Student Unavailable",
    "Tutor Unavailable",
    "Student Absent",
    "Tutor Absent",
  ];

  const options = [...statusOptions];

  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    const allAttendees = selectedMeetings.flatMap(
      (meeting) => meeting.attendees
    );

    if (allAttendees.length > 1) {
      const initialStatuses = allAttendees.reduce((acc, attendee) => {
        const attendeeName = attendee?.name;
        if (attendeeName) {
          // Ensure attendeeName is not undefined
          acc[attendeeName] = attendee.meeting_status || "";
        }
        return acc;
      }, {} as { [key: string]: string });
      setIndividualStatuses(initialStatuses);
    } else if (allAttendees.length === 1) {
    }
  }, [selectedMeetings]);

  const renderStatusSelects = () => {
    if (selectedNames.length > 1) {
      return selectedNames.map((studentName) => {
        const status = individualStatuses[studentName] || "";

        return (
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
                  }
                  inputProps={{
                    readOnly: !session?.user.role
                      .split(",")
                      .map((role) => role.trim())
                      .some((role) => ["Admin", "Tutor"].includes(role)),
                  }}
                >
                  {options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        );
      });
    } else {
      return (
        <FormControl className="w-12">
          <InputLabel id="demo-simple-select-label">Meeting Status</InputLabel>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            inputProps={{
              readOnly: !session?.user.role
                .split(",")
                .map((role) => role.trim())
                .some((role) => ["Admin", "Tutor"].includes(role)),
            }}
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

  useEffect(() => {
    const anyMetStatus =
      selectedNames.length > 1
        ? Object.values(individualStatuses).some((status) => status === "Met")
        : selectedStatus === "Met";

    setIsFormEditable(anyMetStatus);
  }, [selectedNames, selectedStatus, individualStatuses]); // Ensure individualStatuses is tracked for changes

  const handleIndividualStatusChange = (
    studentName: string,
    status: string
  ) => {
    setIndividualStatuses((prev) => ({ ...prev, [studentName]: status }));
  };

  // const isMetStatusPresent = () => {
  //   return Object.values(individualStatuses).some((status) => status === "Met");
  // };

  // const isEditable = isMetStatusPresent();

  /* -------------------------------------------------------------------------- */
  /*                               Program Options                               */
  /* -------------------------------------------------------------------------- */

  const programOptions: string[] = ["Barton", "Connections", "Foundations"];

  const programs = [...programOptions];

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const handleProgramChange = (event: SelectChangeEvent) => {
    const selectedProgram = event.target.value; // selected id
    setFormValues({ ...formValues, program: selectedProgram });
    setSelectedProgram(selectedProgram);
  };

  /* -------------------------------------------------------------------------- */
  /*                           HANDLE SELECTED MEETING                          */
  /* -------------------------------------------------------------------------- */

  const allStudentNames = students.map((student) => {
    const firstName = student?.first_name ?? "";
    const lastName = student?.last_name ?? "";

    return `${firstName} ${lastName}`;
  });
  useEffect(() => {
    setStudentNames(allStudentNames);
  }, [allStudentNames]);

  useEffect(() => {
    const getAttendeeNames = (): string[] => {
      return selectedMeetings.flatMap(
        (meeting) => meeting?.attendees?.map((attendee) => attendee.name) ?? []
      );
    };
    const names = getAttendeeNames();
    setName(names);
    setSelectedNames(names);
  }, [selectedMeetings]);

  useEffect(() => {
    if (selectedMeetings.length > 0) {
      const selectedMeeting = selectedMeetings[0];
      if (!selectedMeeting) return;

      const newStatuses: { [key: string]: string } = {};
      selectedMeeting.attendees?.forEach((attendee) => {
        newStatuses[attendee.name] = attendee.meeting_status || "";
      });
      setIndividualStatuses(newStatuses);

      const metStatusPresent = Object.values(newStatuses).some(
        (status) => status === "Met"
      );
      setIsFormEditable(metStatusPresent);

      const attendeeNames =
        selectedMeeting.attendees?.map((attendee) => {
          const student = students.find((s) => s.id === attendee.student_id);
          const firstName = student?.first_name ?? "";
          const lastName = student?.last_name ?? "";

          return `${firstName} ${lastName}`;
        }) || [];

      setName((prevNames) => [...prevNames, ...attendeeNames]);
      setNamesForSelect(attendeeNames);

      setFormDate(dayjs(selectedMeeting.start));
      const start = dayjs(selectedMeeting.start);
      const end = dayjs(selectedMeeting.end);
      setStartTime(start);
      setEndTime(end);
      const meeting_status =
        selectedMeeting.attendees?.[0]?.meeting_status ?? "";
      setSelectedStatus(meeting_status);
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
        recorded_on: dayjs(),
        edited_by: "",
        edited_on: dayjs(),
        attendees: selectedMeeting.attendees ?? [],
      });
    }
  }, [students, selectedMeetings]);

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
        recorded_on: dayjs(),
        edited_by: "",
        edited_on: dayjs(),
        attendees: [],
      });
      setName([]);
      setSelectedStatus("");
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
      created_at: dayjs().toDate(),
    }));

    setAttendees(getAttendees);
  }, [formValues.attendees]);

  const handleAdd = async (formValues: FormValues) => {
    console.log("Submitting with attendees:", formValues.attendees);

    try {
      const validAttendees = attendees
        .filter((attendee) => attendee.student_id !== undefined) // Filter out undefined student IDs
        .map((attendee) => ({
          student_id: attendee.student_id as number, // Cast to number, since we filtered out undefined
          meeting_status: attendee.meeting_status,
          created_at: dayjs().toDate(),
        }));

      const newMeeting = {
        start: dayjs(start).toDate(),
        end: dayjs(end).toDate(),
        program: formValues.program ?? "",
        level_lesson: formValues.level_lesson ?? "",
        meeting_notes: formValues.meeting_notes ?? "",
        recorded_by: sessionData?.userId.toString() ?? "",
        recorded_on: dayjs().toDate(),
        tutor_id: sessionData?.userId || 0,
        attendees: validAttendees,
      };

      // createMeetingMutation.mutate(newMeeting);

      setName([]);
      setSelectedNames([]);
      setSelectedStatus("");
      setStartTime(dayjs());
      setEndTime(dayjs());

      const response = await createMeetingMutation.mutateAsync(newMeeting);

      if (response.success) {
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
          recorded_on: dayjs(),
          edited_by: "",
          edited_on: dayjs(),
          attendees: [],
        });
      }
    } catch (error) {
      console.error("Error adding meeting:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error adding meeting.",
        life: 3000,
      });
    }
  };

  /* ------------------- edit Meeting ------------------- */
  const updateMeetingMutation = api.meetings.updateMeeting.useMutation();
  const removeAttendees = api.meetings.deleteAttendeesInput.useMutation();

  const editMeeting = (formValues: FormValues) => {
    if (!selectedMeetings.length) {
      return;
    }

    const meetingData = {
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
      onSuccess: () => {
        console.log("Meeting updated successfully");
        toast.current?.show({
          severity: "success",
          summary: "Meeting successfully updated.",
          life: 3000,
        });
        setMeetings([meetingData as MeetingWithAttendees, ...meetings]);
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
    console.log("Deleting meeting with ID:", id);

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
                    onSuccess: () => {
                      // This code runs after the mutation succeeds
                      setMeetings(
                        meetings.filter((meeting) => meeting.id !== id)
                      );
                      setDatedMeetingsWithAttendees(
                        meetings.filter((meeting) => meeting.id !== id)
                      );
                      console.log("*****meeting list*****:", meetings);
                      toast.current?.show({
                        severity: "success",
                        summary: "This meeting has been deleted.",
                        life: 3000,
                      });
                      // Reset form values or other state updates here

                      toastDelete.current?.clear();
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

  const [isFormEditable, setIsFormEditable] = useState(false);

  let hiddenButtonClass = "hidden"; // Default to hidden

  if (isOnMeetingsPage && session?.user.role) {
    const roles = session?.user?.role?.split(",").map((role) => role.trim());
    if (roles.includes("Admin") || roles.includes("Tutor")) {
      hiddenButtonClass = "";
    } else {
      hiddenButtonClass = "hidden";
    }
  }

  if (isOnStudentsPage && session?.user.role) {
    const roles = session?.user?.role?.split(",").map((role) => role.trim());
    if (roles.includes("Admin")) {
      hiddenButtonClass = "";
    } else {
      hiddenButtonClass = "hidden";
    }
  }

  let hiddenFieldClass = "hidden"; // Default to hidden

  if (isOnMeetingsPage && session?.user.role) {
    const roles = session?.user?.role?.split(",").map((role) => role.trim());
    if (roles.includes("Tutor")) {
      hiddenFieldClass = "";
    } else {
      hiddenFieldClass = "hidden";
    }
  }

  if (isOnStudentsPage && session?.user.role) {
    const roles = session?.user?.role?.split(",").map((role) => role.trim());
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
                    console.log("Action completed successfully");
                    // Handle successful response here, if needed
                  })
                  .catch((error) => {
                    // Handle error here
                    console.error("Error in action:", error);
                  });
              }}
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
