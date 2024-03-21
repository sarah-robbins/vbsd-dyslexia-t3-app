import React, { useState, useEffect, useRef } from "react";
import {
  DataTable,
  type DataTableRowEditCompleteEvent,
  type DataTableFilterMeta,
  type DataTableExpandedRows,
  type DataTableValueArray,
  type DataTableRowEvent,
} from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import {
  Column,
  type ColumnBodyOptions,
  type ColumnEditorOptions,
} from "primereact/column";
import { api } from "@/utils/api";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

import type {
  User,
  Student,
  FormValues,
  customSession,
  MeetingAttendees,
  MeetingWithAttendees,
  Meeting,
} from "@/types";
import { InputText } from "primereact/inputtext";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import {
  MultiSelect,
  type MultiSelectChangeEvent,
} from "primereact/multiselect";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import {
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
// import { Button } from "primereact/button";
import Button from "@mui/material/Button";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useSession } from "next-auth/react";
import { Skeleton } from "primereact/skeleton";
import MeetingForm from "@/components/Meetings/MeetingForm/MeetingForm";
import MeetingList from "@/components/Meetings/MeetingList/MeetingList";
// import { useSession } from 'next-auth/react';

interface TutorOption {
  label: string;
  value: number | undefined;
}

interface Props {
  isOnMeetingsPage: boolean;
}

const Students: React.FC<Props> = ({ isOnMeetingsPage }) => {
  let hiddenOnMeetingsPage = "";
  if (isOnMeetingsPage) {
    hiddenOnMeetingsPage = "hidden";
  } else if (!isOnMeetingsPage) {
    hiddenOnMeetingsPage = "flex";
  }
  const toastDelete = useRef<Toast>(null);

  <Toast ref={toastDelete} position="top-center" />;

  const getAllStudents = api.students.getAllStudents.useQuery();
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);
  const toast = useRef<Toast>(null);
  // use the session to get appSettings
  const { data: session } = useSession();
  // const currentUserData = session?.user;
  const appSettings = (session as customSession)?.appSettings;
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    first_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    last_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_assigned_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    school: { value: null, matchMode: FilterMatchMode.CONTAINS },
    grade: { value: null, matchMode: FilterMatchMode.CONTAINS },
    home_room_teacher: { value: null, matchMode: FilterMatchMode.CONTAINS },
    intervention_program: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tutorFullName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date_intervention_began: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    calculateTotalMeetings: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    },
    services: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedMeetings, setSelectedMeetings] = useState<
    MeetingWithAttendees[]
  >([]);
  const [selectedMeetingAttendees] = useState<MeetingAttendees[]>([]);
  // const [attendees, setAttendees] = useState<MeetingAttendees[]>([]);
  const [datedMeetingsWithAttendees, setDatedMeetingsWithAttendees] = useState<
    MeetingWithAttendees[]
  >([]);
  const [attendeesName] = useState<string[]>([]);
  const [isOnStudentsPage] = useState<boolean>(true);

  const { data: myStudents } = api.students.getStudentsForRole.useQuery() as {
    data: Student[];
  };

  const { data: myUsers } = api.users.getUsersForRole.useQuery() as {
    data: User[];
  };
  const [formattedTutors, setFormattedTutors] = useState<TutorOption[]>([]);

  const dateToQuery =
    selectedDate && dayjs.isDayjs(selectedDate) ? selectedDate : dayjs();

  const { data: getDatedMeetings } =
    api.meetings.getMeetingsByRoleAndDate.useQuery(dateToQuery.toDate()) as {
      data: MeetingWithAttendees[];
    };

  const convertMeetings = (meetings: Meeting[]): MeetingWithAttendees[] => {
    return meetings.map((meeting) => {
      let start, end, edited_on, recorded_on;

      if (meeting.start && meeting.start instanceof Date) {
        start = dayjs(meeting.start);
      } else {
        start = meeting.start;
      }

      if (meeting.end && meeting.end instanceof Date) {
        end = dayjs(meeting.end);
      } else {
        end = meeting.end;
      }

      if (meeting.edited_on && meeting.edited_on instanceof Date) {
        edited_on = dayjs(meeting.edited_on);
      } else {
        edited_on = meeting.edited_on;
      }

      if (meeting.recorded_on && meeting.recorded_on instanceof Date) {
        recorded_on = dayjs(meeting.recorded_on);
      } else {
        recorded_on = meeting.recorded_on;
      }

      return {
        ...meeting,
        start,
        end,
        edited_on,
        recorded_on,
        attendees: [], // Add the attendees property
      };
    });
  };

  const { data: roleBasedMeetings } =
    api.meetings.getMeetingsForRole.useQuery();

  useEffect(() => {
    if (roleBasedMeetings) {
      console.log("Role based meetings: ", roleBasedMeetings);
      // Convert dates to Dayjs objects and update state
      const convertedMeetings = convertMeetings(roleBasedMeetings);
      setMeetings(convertedMeetings);
    }
  }, [roleBasedMeetings]);

  const processServices = (
    services: string | string[] | null | undefined
  ): string[] => {
    if (Array.isArray(services)) {
      return services;
    } else if (typeof services === "string") {
      // Split the string by comma, then trim each element
      return services.split(",").map((service) => service.trim());
    } else {
      return [];
    }
  };

  const servicesTemplate = (rowData: Student) => {
    // If services is an array, sort it and convert it to a comma-separated string with spaces
    if (Array.isArray(rowData.services)) {
      return rowData.services.sort().join(", ");
    } else if (typeof rowData.services === "string") {
      // If services is a string, ensure it's formatted with spaces after commas
      return rowData.services
        .split(",")
        .map((s) => s.trim())
        .join(", ");
    }
    return rowData.services;
  };

  // Manipulate Student data for display
  useEffect(() => {
    if (myStudents) {
      const processedStudents = myStudents.map((student) => ({
        ...student,
        services: processServices(student.services).toString(),
        tutorId: student.tutor_id,
        studentFullName: `${student.last_name as string}, ${
          student.first_name as string
        }`,
        tutorFullName: `${student.Users?.first_name as string} ${
          student.Users?.last_name as string
        }`,
        calculateTotalMeetings:
          student.MeetingAttendees?.filter(
            (attendee) => attendee.meeting_status === "Met"
          ).length ?? 0,
      }));
      const initialTutorIds: { [key: number]: number } = {};

      myStudents.forEach((student) => {
        if (student.id !== undefined && student.id !== null) {
          // Check that id is not undefined and not null
          initialTutorIds[student.id] = student.tutor_id || 0;
        }
      });

      setStudents(processedStudents);
      setSelectedTutorIds(initialTutorIds); // Set the initial tutor IDs
    }
  }, [myStudents]);

  // Fetch all tutors (separate API call)
  useEffect(() => {
    if (myUsers) {
      const formattedData = myUsers.map((user) => ({
        label: `${user.first_name as string} ${user.last_name as string}`,
        value: user.id, // Ensure this is the unique identifier
      }));
      setFormattedTutors(formattedData);
    }
  }, [myUsers]);

  const [editingRows, setEditingRows] = useState({});
  const generateTempId = () =>
    Number(
      `-000${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
    );
  const addNewStudent = () => {
    const tempId = generateTempId();
    const newStudent: Student = {
      id: tempId,
      first_name: "First Name",
      last_name: "Last Name",
      student_assigned_id: "Student ID #",
      school: "Unassigned",
      grade: "Grade",
      home_room_teacher: null,
      intervention_program: "Barton",
      tutor_id: null,
      services: "None",
      level_lesson: "",
      new_student: true,
      withdrew: false,
      graduated: false,
      moved: false,
      new_location: "",
      additional_comments: "",
      created_at: new Date(),
      tutorFullName: "",
      tutorInfo: {
        value: 0,
        label: "",
      },
    };
    setStudents((prev) => [newStudent, ...prev]);
    console.log("New Student List: ", students);
    setEditingRows((prevEditingRows) => ({
      ...prevEditingRows,
      [tempId]: true,
    }));
    console.log("Editing Rows: ", editingRows);
  };
  useEffect(() => {
    console.log("Editing Rows Updated:", editingRows);
  }, [editingRows]);
  console.log("Editing Rows Keys:", Object.keys(editingRows));
  console.log(
    "Data Keys:",
    students.map((student) => student.id)
  ); // Assuming 'id' is your dataKey

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };

    if (_filters.global && "value" in _filters.global) {
      _filters.global.value = value || "";
    }
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const textEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Enter a value"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback?.(e.target.value)
        }
      />
    );
  };

  const schoolEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <Dropdown
        value={value}
        options={appSettings.school_options}
        onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
        placeholder="School"
        itemTemplate={(option) => {
          return <span>{option}</span>;
        }}
      />
    );
  };

  const gradeEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <Dropdown
        value={value}
        options={appSettings.grade_options}
        onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
        placeholder="Grade"
        itemTemplate={(option) => {
          return <span>{option}</span>;
        }}
      />
    );
  };

  const programEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <Dropdown
        value={value}
        options={appSettings.program_options}
        onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
        placeholder="Program"
        itemTemplate={(option) => {
          return <span>{option}</span>;
        }}
      />
    );
  };

  const serviceEditor = (options: ColumnEditorOptions) => {
    // Assert the type of options.value
    const value = options.value as string | string[] | null | undefined;
    const currentValue = processServices(value);

    const handleServiceChange = (e: MultiSelectChangeEvent) => {
      // Explicitly cast e.value to string[]
      let selectedServices: string[] = e.value as string[];

      if (selectedServices.includes("None") && selectedServices.length > 1) {
        selectedServices = ["None"];
      } else if (!selectedServices.includes("None")) {
        selectedServices = selectedServices.filter(
          (service) => service !== "None"
        );
      }

      options.editorCallback?.(selectedServices);
    };

    return (
      <MultiSelect
        value={currentValue}
        options={appSettings.services_options.map((service) => ({
          label: service,
          value: service,
        }))}
        onChange={handleServiceChange}
        placeholder="Services"
        optionLabel="label"
        className="text-black"
      />
    );
  };

  const formatServicesForSave = (
    services: string | string[] | null | undefined
  ): string => {
    // If services is a string, split it into an array
    // If services is null or undefined, use an empty array
    const servicesArray =
      typeof services === "string"
        ? services.split(", ").map((s) => s.trim())
        : services || [];
    return Array.from(new Set(servicesArray)).join(", ");
  };

  useEffect(() => {
    console.log("Updated Students: ", students);
  }, [students]);

  const [selectedTutorIds, setSelectedTutorIds] = useState<{
    [key: number]: number;
  }>({});

  const tutorEditor = (options: ColumnEditorOptions) => {
    const rowData = options.rowData as Student;
    const studentId = rowData.id as number;
    const currentTutorId = selectedTutorIds[studentId];

    // const currentTutorId = formattedTutors.find(
    //   (tutor) => tutor.label === rowData.tutorFullName
    // )?.value;

    const handleTutorChange = (studentId: number, e: DropdownChangeEvent) => {
      const newTutorId = e.value as number;
      setSelectedTutorIds((prevSelectedTutorIds) => ({
        ...prevSelectedTutorIds,
        [studentId]: newTutorId,
      }));
      const newTutorLabel = formattedTutors.find(
        (tutor) => tutor.value === newTutorId
      )?.label;

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === rowData.id
            ? {
                ...student,
                tutorId: newTutorId,
                tutor_id: newTutorId, // Update this field as well
                tutorInfo: {
                  value: newTutorId,
                  label: newTutorLabel as string,
                },
              }
            : student
        )
      );
      // Update the rowData for immediate feedback in the UI
      options.editorCallback?.({
        value: e.value as number,
        label: newTutorLabel,
      });
    };

    // Ensure that the dropdown is rendered only after formattedTutors is available
    if (formattedTutors.length > 0) {
      return (
        <Dropdown
          value={currentTutorId}
          options={formattedTutors.map((tutor) => ({
            label: tutor.label,
            value: tutor.value,
          }))}
          onChange={(e) => handleTutorChange(studentId, e)}
          placeholder="Tutor Name"
          optionLabel="label"
        />
      );
    } else {
      return <div>Loading tutors...</div>;
    }
  };

  const updateStudentRowMutation = api.students.updateStudentRow.useMutation();
  const createStudentMutation = api.students.createStudent.useMutation();

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    let { newData } = e as { newData: Student };
    // Transform the services array back into a string
    if (Array.isArray(newData.services)) {
      newData = {
        ...newData,
        services: newData.services.join(", "),
      };
    }

    // Update tutorFullName based on tutorId
    const updatedTutor = formattedTutors.find(
      (tutor) => tutor.value === newData.tutorId
    );
    newData.tutorFullName = updatedTutor ? updatedTutor.label : "";

    // Handle saving the edited data
    let updatedStudents = students;
    if (e.data.id === undefined) {
      // Handling new row
      updatedStudents = students.map((student) =>
        student.id === -1 ? { ...e.data, id: 0 } : student
      );

      // I don't think the id is saving correctly to the savedata. I can see that it is updating the student state, but it is not translating to the save data.

      const dataForSave = {
        ...newData,
        school: newData.school ?? "",
        grade: newData.grade ?? "",
        home_room_teacher: newData.home_room_teacher ?? "",
        tutor_id: selectedTutorIds[newData.id as number] ?? null,
        intervention_program: newData.intervention_program ?? "",
        first_name: newData.first_name ?? "",
        last_name: newData.last_name ?? "",
        student_assigned_id: newData.student_assigned_id ?? "",
        services: formatServicesForSave(newData.services),
        level_lesson: newData.level_lesson ?? "",
        date_intervention_began: newData.date_intervention_began ?? null,
        new_student: newData.new_student ?? false,
        moved: newData.moved ?? false,
        new_location: newData.new_location ?? "",
        withdrew: newData.withdrew ?? false,
        graduated: newData.graduated ?? false,
        additional_comments: newData.additional_comments ?? "",
        last_edited: new Date(),
        created_at: new Date(),
      };
      createStudentMutation.mutate(dataForSave, {
        onSuccess: () => {
          // On success, maybe refresh the data or show a success toast
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Student saved",
          });
        },
        onError: (error) => {
          // On error, show an error toast
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        },
      });
    } else {
      // Handling existing row update
      updatedStudents = students.map((student) =>
        student.id === e.data.id ? { ...e.data } : student
      );
      console.log(updatedStudents);

      const dataForSave = {
        ...newData,
        school: newData.school ?? "",
        grade: newData.grade ?? "",
        home_room_teacher: newData.home_room_teacher ?? "",
        tutor_id: selectedTutorIds[newData.id as number] ?? null,
        intervention_program: newData.intervention_program ?? "",
        first_name: newData.first_name ?? "",
        last_name: newData.last_name ?? "",
        student_assigned_id: newData.student_assigned_id ?? "",
        services: formatServicesForSave(newData.services),
        level_lesson: newData.level_lesson ?? "",
        date_intervention_began: newData.date_intervention_began ?? null,
        new_student: newData.new_student ?? false,
        moved: newData.moved ?? false,
        new_location: newData.new_location ?? "",
        withdrew: newData.withdrew ?? false,
        graduated: newData.graduated ?? false,
        additional_comments: newData.additional_comments ?? "",
        last_edited: new Date(),
        created_at: new Date(),
      };

      // Call the mutation to update the student
      updateStudentRowMutation.mutate(dataForSave, {
        onSuccess: () => {
          // On success, maybe refresh the data or show a success toast
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Student updated",
          });
        },
        onError: (error) => {
          // On error, show an error toast
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        },
      });
    }
  };

  const updateStudentExtraDataMutation =
    api.students.updateStudentExtraData.useMutation();

  //update the student extra data
  const updateStudentExtraData = (data: Student) => {
    // Ensure that id is provided
    if (!data.id) {
      console.error("No student ID provided for update");
      return;
    }

    // Prepare the data object, excluding undefined fields
    const updateData = {
      level_lesson: data.level_lesson ?? null,
      date_intervention_began: data.date_intervention_began
        ? new Date(data.date_intervention_began.toString())
        : null,
      new_student: data.new_student ?? false,
      moved: data.moved ?? false,
      new_location: data.new_location ?? null,
      withdrew: data.withdrew ?? false,
      graduated: data.graduated ?? false,
      additional_comments: data.additional_comments ?? null,
      last_edited: new Date(),
    };

    updateStudentExtraDataMutation.mutate(
      { id: data.id, ...updateData },
      {
        onSuccess: () => {
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Student extra data updated",
          });
        },
        onError: (error) => {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        },
      }
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                                EXPANDED ROWS                               */
  /* -------------------------------------------------------------------------- */

  // const onRowExpand = (event: DataTableRowEvent) => {
  //   toast.current?.show({
  //     severity: "info",
  //     summary: "Product Expanded",
  //     detail: event.data.id as number,
  //     life: 3000,
  //   });
  // };

  // const onRowCollapse = (event: DataTableRowEvent) => {
  //   toast.current?.show({
  //     severity: "success",
  //     summary: "Product Collapsed",
  //     detail: event.data.id as number,
  //     life: 3000,
  //   });
  // };

  const expandAll = () => {
    const _expandedRows: DataTableExpandedRows = {};
    students.forEach((student) => {
      if (student.id !== undefined) {
        _expandedRows[`${student.id}`] = true;
      }
    });
    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows(undefined);
  };

  const allowExpansion = (rowData: Student) => {
    if (rowData.id) {
      return rowData?.id > 0;
    } else {
      return false;
    }
  };

  const [additionalFormValues, setAdditionalFormValues] =
    useState<FormValues>();

  const [interventionDate, setInterventionDate] = useState<Dayjs>();
  const handleInterventionDateChange = (date: Dayjs | null) => {
    if (date) {
      setInterventionDate(date);
    }
  };

  const currentDate = dayjs();
  const currentYear =
    currentDate.month() <= 7 ? currentDate.year() - 1 : currentDate.year();
  const augustFirstLastYear = dayjs(new Date(currentYear, 7, 1));

  const [beginningSearchDate, setBeginningSearchDate] =
    useState<Dayjs>(augustFirstLastYear);
  const handleBeginningSearchDateChange = (date: Dayjs | null) => {
    if (date) {
      setBeginningSearchDate(date);
    }
  };

  const [endingSearchDate, setEndingSearchDate] = useState<Dayjs>(dayjs());
  const handleEndingSearchDateChange = (date: Dayjs | null) => {
    if (date) {
      setEndingSearchDate(date);
    }
  };

  const rowExpansionTemplate = (data: Student) => {
    const calculateTotalMeetings =
      data.MeetingAttendees?.filter(
        (attendee) => attendee.meeting_status === "Met"
      ).length ?? 0;

    const calculateStudentAbsences =
      data.MeetingAttendees?.filter(
        (attendee) => attendee.meeting_status === "Student Absent"
      ).length ?? 0;

    const calculateTutorAbsences =
      data.MeetingAttendees?.filter(
        (attendee) => attendee.meeting_status === "Tutor Absent"
      ).length ?? 0;

    const calculateStudentUnavailable =
      data.MeetingAttendees?.filter(
        (attendee) => attendee.meeting_status === "Student Unavailable"
      ).length ?? 0;

    const calculateTutorUnavailable =
      data.MeetingAttendees?.filter(
        (attendee) => attendee.meeting_status === "Tutor Unavailable"
      ).length ?? 0;

    const handleSwitchChange = (field: keyof Student, value: boolean) => {
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === data.id ? { ...student, [field]: value } : student
        )
      );
    };

    const handleUpdateClick = () => {
      const updateData = {
        ...additionalFormValues,
        id: data.id,
        level_lesson: additionalFormValues?.level_lesson ?? null,
        date_intervention_began: interventionDate ?? null,
        new_student: data.new_student,
        moved: data.moved,
        new_location: additionalFormValues?.new_location ?? null,
        withdrew: data.withdrew,
        graduated: data.graduated,
        additional_comments: additionalFormValues?.additional_comments,
        tutorFullName: data.tutorFullName,
        tutorInfo: data.tutorInfo,
      };
      updateStudentExtraData(updateData);
    };

    const studentMeetings = getDatedMeetings?.filter((meeting) =>
      meeting.MeetingAttendees?.some(
        (attendee) => attendee.student_id === data.id
      )
    );

    return (
      <>
        <div className="expansion-row flex flex-row gap-3">
          <Card className="expansion-row__item w-6">
            <h3>Additional Info {data.first_name}</h3>
            <div className="flex gap-4">
              <TextField
                id="outlined-multiline-flexible"
                value={data?.level_lesson}
                onChange={(e) =>
                  setAdditionalFormValues({
                    ...additionalFormValues,
                    level_lesson: e.target.value,
                  })
                }
                label="Level/Lesson"
                className="w-12"
                inputProps={{
                  readOnly: !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Principal"].includes(role)),
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date Intervention Began"
                  className="w-12"
                  value={dayjs(data.date_intervention_began)}
                  onChange={handleInterventionDateChange}
                  readOnly={
                    !session?.user.role
                      .split(",")
                      .map((role) => role.trim())
                      .some((role) => ["Admin", "Principal"].includes(role))
                  }
                />
              </LocalizationProvider>
            </div>
            <div className="flex">
              <FormControlLabel
                control={
                  <Switch
                    checked={data.new_student || false}
                    onChange={(e) =>
                      handleSwitchChange("new_student", e.target.checked)
                    }
                    inputProps={{
                      disabled: !session?.user.role
                        .split(",")
                        .map((role) => role.trim())
                        .some((role) => ["Admin", "Principal"].includes(role)),
                    }}
                  />
                }
                label="New"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={data.withdrew === true}
                    onChange={(e) =>
                      handleSwitchChange("withdrew", e.target.checked)
                    }
                    inputProps={{
                      disabled: !session?.user.role
                        .split(",")
                        .map((role) => role.trim())
                        .some((role) => ["Admin", "Principal"].includes(role)),
                    }}
                  />
                }
                label="Withdrew"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={data.graduated === true}
                    onChange={(e) =>
                      handleSwitchChange("graduated", e.target.checked)
                    }
                    inputProps={{
                      disabled: !session?.user.role
                        .split(",")
                        .map((role) => role.trim())
                        .some((role) => ["Admin", "Principal"].includes(role)),
                    }}
                  />
                }
                label="Graduated"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={data.moved === true}
                    onChange={(e) =>
                      handleSwitchChange("moved", e.target.checked)
                    }
                    inputProps={{
                      disabled: !session?.user.role
                        .split(",")
                        .map((role) => role.trim())
                        .some((role) => ["Admin", "Principal"].includes(role)),
                    }}
                  />
                }
                label="Moved"
              />

              <TextField
                id="outlined-multiline-flexible"
                value={data?.new_location}
                onChange={(e) =>
                  setAdditionalFormValues({
                    ...additionalFormValues,
                    new_location: e.target.value,
                  })
                }
                label="Location Moved To"
                className="w-12"
                inputProps={{
                  readOnly: !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Principal"].includes(role)),
                }}
              />
            </div>
            <TextField
              id="outlined-multiline-flexible"
              value={data?.additional_comments}
              onChange={(e) =>
                setAdditionalFormValues({
                  ...additionalFormValues,
                  additional_comments: e.target.value,
                })
              }
              label="Additional Comments"
              className="w-12"
              multiline
              inputProps={{
                readOnly: !session?.user.role
                  .split(",")
                  .map((role) => role.trim())
                  .some((role) => ["Admin", "Principal"].includes(role)),
              }}
            />
            <div>
              <Button onClick={handleUpdateClick}>Save</Button>
            </div>
          </Card>
          <Card className="expansion-row__item w-6">
            <h3>Meeting Stats</h3>
            <div className="flex gap-4 justify-content-between text-center">
              <div className="flex w-10">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    className="w-full"
                    value={beginningSearchDate}
                    onChange={handleBeginningSearchDateChange}
                  />
                </LocalizationProvider>
              </div>
              <div className="flex w-1 min-h-full align-items-center justify-content-center">
                <span className="font-bold">To</span>
              </div>

              <div className="flex w-10">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    className="w-full"
                    value={endingSearchDate}
                    onChange={handleEndingSearchDateChange}
                  />
                </LocalizationProvider>
              </div>
            </div>
            {/* The next part of this will need to show the different meeting statuses and how many occur for tha attendee during the time period in the search. */}
            <div className="flex gap-4">
              <div>
                <span>Meetings</span>
                <TextField
                  id="outlined-multiline-flexible"
                  value={calculateTotalMeetings}
                  className="w-12"
                />
              </div>
              <div>
                <span>Student Absences</span>
                <TextField
                  id="outlined-multiline-flexible"
                  value={calculateStudentAbsences}
                  className="w-12"
                />
              </div>
              <div>
                <span>Tutor Absences</span>
                <TextField
                  id="outlined-multiline-flexible"
                  value={calculateTutorAbsences}
                  className="w-12"
                />
              </div>
              <div>
                <span>Student Unavailable</span>
                <TextField
                  id="outlined-multiline-flexible"
                  value={calculateStudentUnavailable}
                  className="w-12"
                />
              </div>
              <div>
                <span>Tutor Unavailable</span>
                <TextField
                  id="outlined-multiline-flexible"
                  value={calculateTutorUnavailable}
                  className="w-12"
                />
              </div>
            </div>
          </Card>
        </div>
        <div
          className={`flex-column lg:flex-row gap-3 mt-3 ${hiddenOnMeetingsPage}`}
        >
          <MeetingForm
            meetings={meetings}
            setMeetings={setMeetings}
            students={students}
            getDatedMeetings={studentMeetings}
            selectedMeetings={selectedMeetings}
            setSelectedMeetings={setSelectedMeetings}
            isMeetingSelected={!!selectedMeetings}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setDatedMeetingsWithAttendees={setDatedMeetingsWithAttendees}
            selectedMeetingAttendees={selectedMeetingAttendees}
            isOnStudentsPage={isOnStudentsPage}
            isOnMeetingsPage={false}
          />
          <MeetingList
            meetings={meetings}
            students={students}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            getDatedMeetings={studentMeetings}
            selectedMeetings={selectedMeetings}
            setSelectedMeetings={setSelectedMeetings}
            datedMeetingsWithAttendees={datedMeetingsWithAttendees}
            attendeesName={attendeesName}
            isOnStudentsPage={isOnStudentsPage}
            isOnMeetingsPage={false}
          />
        </div>
      </>
    );
  };
  const deleteStudentMutation = api.students.deleteStudent.useMutation();

  const handleDeleteStudent = (studentId?: number) => {
    const id = studentId || 0;
    // Call the TRPC mutation to delete the student
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
              Are you sure you want to delete this student?
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                try {
                  console.log("Deleting meeting with ID from try block:", id);
                  deleteStudentMutation.mutate({ id: id });
                  console.log("meeting list:", meetings);
                } catch (error) {
                  console.error(`Error deleting this meeeting.`);
                }

                if (deleteStudentMutation.isSuccess) {
                  setStudents((students) =>
                    students.filter((student) => student.id !== studentId)
                  );

                  // Optionally, show a success message
                  toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Student deleted",
                    life: 3000,
                  });
                }

                if (deleteStudentMutation.isError) {
                  toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    life: 3000,
                  });
                }
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

  // const actionBodyTemplate = (rowData: Student) => {
  //   if (typeof rowData.id !== "number") {
  //     return null;
  //   }
  //   return (
  //     <DeleteIcon
  //       color="error"
  //       onClick={() => handleDeleteStudent(rowData.id)}
  //     />
  //   );
  // };

  const renderHeader = () => {
    return (
      <div className="flex flex-row justify-content-between">
        <div className="flex justify-content-start gap-2">
          {session?.user.role !== "Tutor" && (
            <div className="flex align-items-center">
              <Button onClick={addNewStudent} variant="contained">
                Add
              </Button>
            </div>
          )}
          <Button onClick={expandAll}>Expand All</Button>
          <Button onClick={collapseAll}>Collapse All</Button>
        </div>
        <div className="flex">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search"
            />
          </span>
        </div>
      </div>
    );
  };
  const header = renderHeader();

  // const rows = [editingRow, ...students].filter((r) => r != null);

  // load animation for the table
  if (!getAllStudents.data)
    return (
      <div className="flex w-full h-full">
        <CircularProgress
          color="primary"
          className="flex align-items-center justify-content-center"
        />
      </div>
    );

  // choose waht to do when a row in clicked
  const rowSelected = (e: DataTableRowEvent) => {
    console.log("e", e);
  };

  // style the row based on conditions
  const newRowClass = (data: Student) => {
    return {
      // FIXME: cannot get the right color of green to match the header
      "bg-green-50":
        data.new_student === true && data.id !== undefined && data.id > -2,
      "bg-red-100": data.first_name === "First Name",
      "text-primary":
        data.new_student === true && data.id !== undefined && data.id > -2,
      "border-8":
        data.new_student === true && data.id !== undefined && data.id > -2,
    };
  };

  const loadingTemplate = () => {
    return <Skeleton />;
  };

  const editRowIcons = (rowData: Student, options: ColumnBodyOptions) => (
    <>
      {options.rowEditor?.editing ? (
        <div className="flex gap-1 justify-content-center">
          <CheckIcon
            onClick={(e) =>
              options.rowEditor?.onSaveClick &&
              options.rowEditor?.onSaveClick(e)
            }
            color="primary"
          />
          <CloseIcon
            onClick={(e) =>
              options.rowEditor?.onCancelClick &&
              options.rowEditor?.onCancelClick(e)
            }
            color="error"
          />
        </div>
      ) : (
        <div className="flex gap-1 justify-content-center">
          <CreateIcon
            onClick={(e) =>
              options.rowEditor?.onInitClick &&
              options.rowEditor?.onInitClick(e)
            }
            color="warning"
          />
          <DeleteIcon
            color="error"
            onClick={() => handleDeleteStudent(rowData.id)}
          />
        </div>
      )}
    </>
  );

  // function t(arg0: string): string | undefined {
  //   throw new Error("Function not implemented.");
  // }

  // function confirmDialog(arg0: {
  //   message: string;
  //   header: string;
  //   icon: string;
  //   accept: () => any;
  // }): void {
  //   throw new Error("Function not implemented.");
  // }

  // function handleDelete(id: any) {
  //   throw new Error("Function not implemented.");
  // }

  // function rowEditorTemplate(options: ColumnEditorOptions): React.ReactNode {
  //   throw new Error("Function not implemented.");
  // }

  return (
    <Card className="card">
      <Toast ref={toast} />
      <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
        <h3>Students</h3>
      </div>
      <DataTable
        className="students-table"
        value={students}
        editMode="row"
        // onRowEditInit={(e) => setEditingRows(e.data.id)}
        editingRows={editingRows}
        onRowEditComplete={onRowEditComplete}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        // onRowExpand={onRowExpand}
        // onRowCollapse={onRowCollapse}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        stripedRows
        removableSort
        rowClassName={newRowClass}
        onRowSelect={rowSelected}
        tableStyle={{ minWidth: "60rem" }}
        filters={filters}
        globalFilterFields={[
          "first_name",
          "last_name",
          "school",
          "grade",
          "home_room_teacher",
          "intervention_program",
          "tutorFullName",
          "date_intervention_began",
          "calculateTotalMeetings",
          "services",
        ]}
        header={header}
        emptyMessage="No students match your search."
        showGridlines
      >
        <Column
          expander={allowExpansion}
          style={{ width: "5rem" }}
          header="Expand"
        />
        <Column
          field="student_assigned_id"
          header="Student ID #"
          editor={(options) => textEditor(options)}
          sortable
        />
        <Column
          field="first_name"
          header="First Name"
          editor={(options) => textEditor(options)}
          sortable
        />
        <Column
          field="last_name"
          header="Last Name"
          editor={(options) => textEditor(options)}
          sortable
        />
        <Column
          field="school"
          header="School"
          editor={(options) => schoolEditor(options)}
          sortable
        />
        <Column
          field="grade"
          header="Grade"
          editor={(options) => gradeEditor(options)}
          sortable
        />
        <Column
          field="home_room_teacher"
          header="Home Room Teacher"
          editor={(options) => textEditor(options)}
          sortable
        />
        <Column
          field="intervention_program"
          header="Program"
          editor={(options) => programEditor(options)}
          sortable
        />
        <Column
          field="tutorFullName"
          header="Tutor"
          style={{ whiteSpace: "nowrap" }}
          editor={(options) => tutorEditor(options)}
          sortable
        />
        <Column
          field="calculateTotalMeetings"
          header="Total Meetings"
          sortable
          body={!students ? loadingTemplate : null}
        />
        <Column
          field="services"
          header="Services"
          body={servicesTemplate}
          editor={(options) => serviceEditor(options)}
          sortable
        />
        {session?.user.role !== "Tutor" && (
          <Column
            header="Actions"
            rowEditor
            body={editRowIcons}
            headerStyle={{ width: "1%" }}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
        )}
      </DataTable>
    </Card>
  );
};

export default Students;
