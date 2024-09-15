import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DataTable,
  type DataTableRowEditCompleteEvent,
  type DataTableFilterMeta,
  type DataTableExpandedRows,
  type DataTableValueArray,
  // type DataTableRowEvent,
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
  IconButton,
  Switch,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useSession } from "next-auth/react";
import { Skeleton } from "primereact/skeleton";
import MeetingForm from "@/components/Meetings/MeetingForm/MeetingForm";
import MeetingList from "@/components/Meetings/MeetingList/MeetingList";
import AddStudentForm from "../AddStudentForm";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import {
  type WorkBook,
  type WorkSheet,
  utils as XLSXUtils,
  write as XLSXWrite,
} from "xlsx";
import { TableRows, TextSnippet } from "@mui/icons-material";

interface TutorOption {
  label: string;
  value: number | undefined;
}

interface ExportColumn {
  title: string;
  dataKey: keyof Student;
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
  const { data: session } = useSession();
  const sessionData = session?.user;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const [runSuccessToast, setRunSuccessToast] = React.useState(false);
  const toastDelete = useRef<Toast>(null);
  useEffect(() => {
    if (runSuccessToast === true) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "User saved",
      });
    }
  }, [runSuccessToast]);

  const getAllStudents = api.students.getAllStudents.useQuery();
  const [students, setStudents] = useState<Student[]>([]);
  const dt = useRef<DataTable<Student[]>>(null);
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);
  const toast = useRef<Toast>(null);
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
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [meetings, setMeetings] = useState<MeetingWithAttendees[]>([]);
  const [allMeetings, setAllMeetings] = useState<MeetingWithAttendees[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [studentDates, setStudentDates]  = useState<{ [studentId: number]: Dayjs }>({});
  const [selectedMeetings, setSelectedMeetings] = useState<
  MeetingWithAttendees[]
  >([]);
  const [selectedMeetingAttendees] = useState<MeetingAttendees[]>([]);
  const [datedMeetingsWithAttendees, setDatedMeetingsWithAttendees] = useState<
    MeetingWithAttendees[]
  >([]);
  const [isOnStudentsPage] = useState<boolean>(true);
  const [myStudents, setMyStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formattedTutors, setFormattedTutors] = useState<TutorOption[]>([]);
  const [isFormValid, setIsFormValid] = useState<{ [key: number]: boolean }>({});
  const [editingRows] = useState({});
  const [selectedTutorIds, setSelectedTutorIds] = useState<{
    [key: number]: number;
  }>({});
  const [additionalFormValues, setAdditionalFormValues] =
    useState<FormValues>();
  const [interventionDate, setInterventionDate] = useState<Dayjs>();

  const { data: getStudentsForTutor } =
    api.students.getStudentsForTutor.useQuery(sessionData?.userId || 0) as {
      data: Student[];
    };
  const { data: getStudentsForRole } =
    api.students.getStudentsForRole.useQuery() as {
      data: Student[];
    };  
  const { data: myUsers } = api.users.getUsersForRole.useQuery() as {
      data: User[];
    };  
  const dateToQuery =
    selectedDate && dayjs.isDayjs(selectedDate) ? selectedDate : dayjs();
  const { data: getDatedMeetings } =
    api.meetings.getMeetingsByRoleAndDate.useQuery(dateToQuery.toDate()) as {
      data: MeetingWithAttendees[];
    };
  const { data: roleBasedMeetings } =
    api.meetings.getMeetingsForRole.useQuery();


  useEffect(() => {
    if (isOnMeetingsPage) {
      setMyStudents(getStudentsForTutor);
    } else {
      setMyStudents(getStudentsForRole);
    }  
  }, [
    getStudentsForRole,
    getStudentsForTutor,
    isOnMeetingsPage,
    sessionData?.userId,
  ]);  

  useEffect(() => {
    if (myUsers) {
      setUsers(myUsers);
    }  
  }, [myUsers]);  

  useEffect(() => {
    if (getDatedMeetings) {
      setDatedMeetingsWithAttendees(getDatedMeetings);
    }  
  }, [getDatedMeetings]);  

  useEffect(() => {
    if (roleBasedMeetings) {
      const meetingsWithAttendees = roleBasedMeetings.map(meeting => ({
        ...meeting,
        MeetingAttendees: meeting.MeetingAttendees.map(attendee => ({
          ...attendee,
          name: attendee.name || '',
        })),
      }));
      setAllMeetings(meetingsWithAttendees);
    }
  }, [roleBasedMeetings]);

  const checkFormValidity = (student: Student) => {
    const isStudentValid = !!(
      student.student_assigned_id &&
      student.first_name &&
      student.last_name &&
      student.school &&
      student.grade
    );
    setIsFormValid(prev => ({ ...prev, [student.id as number]: isStudentValid }));
    return isStudentValid;
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
        attendees: [],
      };
    });
  };

  useEffect(() => {
    if (roleBasedMeetings) {
      const mappedMeetings = roleBasedMeetings.map(meeting => ({
        ...meeting,
        MeetingAttendees: meeting.MeetingAttendees.map(attendee => ({
          ...attendee,
          name: attendee.name || undefined,
        })),
      }));
      setMeetings(mappedMeetings);
    }
  }, [roleBasedMeetings]);

  const processServices = (
    services: string | string[] | null | undefined
  ): string[] => {
    if (Array.isArray(services)) {
      return services;
    } else if (typeof services === "string") {
      return services.split(",").map((service) => service.trim());
    } else {
      return [];
    }
  };

  const servicesTemplate = (rowData: Student) => {
    if (Array.isArray(rowData.services)) {
      return rowData.services.sort().join(", ");
    } else if (typeof rowData.services === "string") {
      return rowData.services
        .split(",")
        .map((s) => s.trim())
        .join(", ");
    }
    return String(rowData.services || '');
  };

  useEffect(() => {
    if (myStudents) {
      const processedStudents = myStudents.map((student) => ({
        ...student,
        services: processServices(student.services).toString(),
        tutorId: student.tutor_id,
        tutor_id: student.tutor_id,
        studentFullName: `${student.last_name as string}, ${student.first_name as string}`,
        tutorFullName: student.tutor_id
          ? `${student.Users?.first_name as string} ${student.Users?.last_name as string}`
          : "Unassigned",
        calculateTotalMeetings:
          student.MeetingAttendees?.filter(
            (attendee) => attendee.meeting_status === "Met"
          ).length ?? 0,
      }));

      const initialTutorIds: { [key: number]: number } = {};

      myStudents.forEach((student) => {
        if (student.id !== undefined && student.id !== null) {
          initialTutorIds[student.id] = student.tutor_id || 0;
        }
      });

      const sortedStudents = processedStudents.sort((a, b) => {
        if (a.new_student && !b.new_student) return -1;
        if (!a.new_student && b.new_student) return 1;
        if ((a.school ?? '') < (b.school ?? '')) return -1;
        if ((a.school ?? '') > (b.school ?? '')) return 1;
        if ((a.last_name ?? '') < (b.last_name ?? '')) return -1;
        if ((a.last_name ?? '') > (b.last_name ?? '')) return 1;
        return 0;
      });

      setStudents(sortedStudents);
      setSelectedTutorIds(initialTutorIds);
    }
  }, [myStudents]);
    
  useEffect(() => {
    if (myUsers) {
      const formattedData = myUsers.map((user) => ({
        label: `${user.first_name as string} ${user.last_name as string}`,
        value: user.id,
      }));
      setFormattedTutors(formattedData);
    }
  }, [myUsers]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Keep the original value for display
    const lowerCaseValue = value.toLowerCase(); // Use lowercase for filtering
    const _filters: DataTableFilterMeta = { ...filters };
  
    if (_filters.global && "value" in _filters.global) {
      _filters.global.value = value; // Use the original value here
    }
    setFilters(_filters);
    setGlobalFilterValue(value); // Use the original value here
  
    const filtered = students.filter(
      (student) =>
        student.first_name?.toLowerCase().includes(lowerCaseValue) ||
        student.last_name?.toLowerCase().includes(lowerCaseValue) ||
        student.school?.toLowerCase().includes(lowerCaseValue) ||
        student.grade?.toLowerCase().includes(lowerCaseValue) ||
        student.home_room_teacher?.toLowerCase().includes(lowerCaseValue) ||
        student.intervention_program?.toLowerCase().includes(lowerCaseValue) ||
        student.tutorFullName?.toLowerCase().includes(lowerCaseValue) ||
        (student.services && student.services.toLowerCase().includes(lowerCaseValue))
    );
  
    setFilteredStudents(filtered);
  };
  const studentIdEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    const isError = !value;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Student ID"
        className={isError ? "input-error" : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
          checkFormValidity({ ...options.rowData, student_assigned_id: e.target.value } as Student);
        }}
      />
    );
  };

  const firstNameEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    const isError = !value; 
    return (
      <InputText
        type="text"
        value={value}
        placeholder="First Name"
        className={isError ? "input-error" : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
          checkFormValidity({ ...options.rowData, first_name: e.target.value } as Student);
        }}
      />
    );
  };

  const lastNameEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    const isError = !value;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Last Name"
        className={isError ? "input-error" : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
          checkFormValidity({ ...options.rowData, last_name: e.target.value } as Student);
        }}
      />
    );
  };

  const teacherEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Home Room Teacher"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback?.(e.target.value)
        }
      />
    );
  };

  const schoolEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    const isError = !value; 
    return (
      <Dropdown
        value={value}
        options={appSettings.school_options}
        className={isError ? "input-error" : ""}
        onChange={(e: DropdownChangeEvent) => {
          options.editorCallback?.(e.value);
          checkFormValidity({ ...options.rowData, school: e.value as string } as Student);
        }}
        placeholder="School"
        itemTemplate={(option) => {
          return <span>{option}</span>;
        }}
        filter
        resetFilterOnHide
      />
    );
  };

  const gradeEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    const isError = !value;
    return (
      <Dropdown
        value={value}
        options={appSettings.grade_options}
        className={isError ? "input-error" : ""}
        onChange={(e: DropdownChangeEvent) => {
          options.editorCallback?.(e.value);
          checkFormValidity({ ...options.rowData, grade: e.value as string } as Student);
        }}
        placeholder="Grade"
        filter
        resetFilterOnHide
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
        onChange={(e: DropdownChangeEvent) => {
          options.editorCallback?.(e.value);
        }}
        placeholder="Program"
        // editable
        itemTemplate={(option) => {
          return <span>{option}</span>;
        }}
      />
    );
  };

  const serviceEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string | string[] | undefined;
    const currentValue = processServices(value) as string[] | undefined;

    const handleServiceChange = (e: MultiSelectChangeEvent) => {
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
        selectAllLabel="All"
        className="text-black"
      />
    );
  };

  const formatServicesForSave = (
    services: string | string[] | null | undefined
  ): string => {
    const servicesArray =
      typeof services === "string"
        ? services.split(", ").map((s) => s.trim())
        : services || [];
    return Array.from(new Set(servicesArray)).join(", ");
  };

  const tutorEditor = (options: ColumnEditorOptions) => {
    const rowData = options.rowData as Student;
    const studentId = rowData.id as number;
    const currentTutorId = selectedTutorIds[studentId] ?? 0;
  
    const handleTutorChange = (e: DropdownChangeEvent) => {
      const newTutorId = e.value as number;
      const newTutor = newTutorId === 0 ? null : users.find(user => user.id === newTutorId);
      const newTutorLabel = newTutor ? `${newTutor.first_name || ''} ${newTutor.last_name || ''}` : "Unassigned";

      setSelectedTutorIds(prev => ({
        ...prev,
        [studentId]: newTutorId,
      }));

      const updatedRowData = {
        ...rowData,
        tutorId: newTutorId,
        tutor_id: newTutorId === 0 ? null : newTutorId,
        tutorFullName: newTutorLabel,
        Users: newTutor ? {
          id: newTutor.id,
          first_name: newTutor.first_name,
          last_name: newTutor.last_name,
        } : null,
      };
      options.editorCallback?.(updatedRowData);
    };
  
    const dropdownOptions = [
      { label: "Unassigned", value: 0 },
      ...formattedTutors.map((tutor) => ({
        label: tutor.label,
        value: tutor.value,
      })),
    ];
  
    return (
      <Dropdown
        value={currentTutorId}
        options={dropdownOptions}
        onChange={handleTutorChange}
        placeholder="Tutor Name"
        optionLabel="label"
        filter
        resetFilterOnHide
      />
    );
  };

  const updateStudentRowMutation = api.students.updateStudentRow.useMutation();

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    const { newData } = e as { newData: Student; index: number };
    if (!checkFormValidity(newData)) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all required fields",
      });
      return;
    }

    const tutorId = selectedTutorIds[newData.id as number] ?? 0;
  
    if (tutorId !== 0 && !users.some(user => user.id === tutorId)) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Invalid tutor selected",
      });
      return;
    }

    const selectedTutor = users.find(user => user.id === tutorId);
    const tutorFullName = selectedTutor 
      ? `${selectedTutor.first_name || ''} ${selectedTutor.last_name || ''}` 
      : "Unassigned";

    const dataForSave = {
      ...newData,
      school: newData.school ?? "",
      grade: newData.grade ?? "",
      home_room_teacher: newData.home_room_teacher ?? "",
      tutor_id: tutorId === 0 ? null : tutorId,
      tutorId: tutorId,
      tutorFullName: tutorFullName,
      Users: selectedTutor ? {
        id: selectedTutor.id,
        first_name: selectedTutor.first_name,
        last_name: selectedTutor.last_name,
      } : undefined,
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
      // created_at: new Date(),
    };

    const { id } = dataForSave;

    if (!id) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Student ID is missing",
      });
      return;
    }
    updateStudentRowMutation.mutate(
      { 
        id: newData.id, 
        ...dataForSave 
      },
      {
        onSuccess: (response) => {
          if (response) {
            setStudents((prevStudents) => {
              if (isOnMeetingsPage) {
                // If on Meetings page, remove the student if the tutor has changed
                if (tutorId !== sessionData?.userId) {
                  return prevStudents.filter(student => student.id !== newData.id);
                }
              }

              const newStudents = prevStudents.map((student) =>
                student.id === newData.id
                  ? {
                      ...student,
                      ...response,
                      tutorId: tutorId,
                      tutor_id: tutorId === 0 ? null : tutorId,
                      tutorFullName: tutorFullName,
                      Users: dataForSave.Users,                      
                    }
                  : student
              );
              return newStudents;
            });
            toast.current?.show({
              severity: "success",
              summary: "Success",
              detail: isOnMeetingsPage && tutorId !== sessionData?.userId
                ? "Student removed from your list"
                : "Student updated",
            });
          }
        },
        onError: (error) => {
          console.error('Error updating student:', error);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        },
      }
    );
  };

  const updateStudentExtraDataMutation =
    api.students.updateStudentExtraData.useMutation();

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

  const TutorCell = React.memo(function TutorCell({ rowData }: { rowData: Student }) {
    
    if (rowData.Users && typeof rowData.Users === 'object') {
      return <span>{`${rowData.Users.first_name || ''} ${rowData.Users.last_name || ''}`}</span>;
    }
    if (typeof rowData.tutorFullName === 'string' && rowData.tutorFullName !== "Unassigned") {
      return <span>{rowData.tutorFullName}</span>;
    }
    if ((rowData.tutor_id === null && rowData.tutorId === undefined) || rowData.tutorFullName === "Unassigned") {
      return <span>Unassigned</span>;
    }
    return <span>Tutor Name Not Available</span>;
  });
  
  const tutorBodyTemplate = (rowData: Student) => <TutorCell rowData={rowData} />;

  useEffect(() => {
    // Initialize dates for all students
    const initialDates: { [studentId: number]: Dayjs } = {};
    students.forEach(student => {
      if (student.id !== undefined) {
        initialDates[student.id] = studentDates[student.id] || selectedDate;
      }
    });
    setStudentDates(initialDates);
  }, [students, selectedDate]);

  const handleStudentDateChange = useCallback((date: Dayjs, studentId: number) => {
    setStudentDates((prevDates: { [key: number]: Dayjs }) => ({
      ...prevDates,
      [studentId]: date
    }));
  }, []);
  
  const rowExpansionTemplate = (data: Student) => {
    const calculateMeetingsInDateRange = (
      attendees: MeetingAttendees[],
      status: string,
      startDate: Dayjs,
      endDate: Dayjs
    ) => {
      return attendees?.filter(
        (attendee) => 
          attendee.meeting_status === status &&
          attendee.Meetings &&
          dayjs(attendee.Meetings.start).isAfter(startDate) &&
          dayjs(attendee.Meetings.start).isBefore(endDate)
      ).length ?? 0;
    };

    const calculateTotalMeetings = calculateMeetingsInDateRange(
      data.MeetingAttendees || [],
      "Met",
      beginningSearchDate,
      endingSearchDate
    );

    const calculateStudentAbsences = calculateMeetingsInDateRange(
      data.MeetingAttendees || [],
      "Student Absent",
      beginningSearchDate,
      endingSearchDate
    );

    const calculateTutorAbsences = calculateMeetingsInDateRange(
      data.MeetingAttendees || [],
      "Tutor Absent",
      beginningSearchDate,
      endingSearchDate
    );

    const calculateStudentUnavailable = calculateMeetingsInDateRange(
      data.MeetingAttendees || [],
      "Student Unavailable",
      beginningSearchDate,
      endingSearchDate
    );

    const calculateTutorUnavailable = calculateMeetingsInDateRange(
      data.MeetingAttendees || [],
      "Tutor Unavailable",
      beginningSearchDate,
      endingSearchDate
    );

    const handleSwitchChange = (field: keyof Student, value: boolean) => {
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === data.id ? { ...student, [field]: value } : student
        )
      );
    };

    const handleUpdateClick = () => {
      const updateData = {
        id: data.id,
        level_lesson: additionalFormValues?.level_lesson ?? data.level_lesson,
        date_intervention_began: interventionDate?.toDate() || null,
        new_student: data.new_student ?? false,
        moved: data.moved ?? false,
        new_location: additionalFormValues?.new_location ?? data.new_location,
        withdrew: data.withdrew ?? false,
        graduated: data.graduated ?? false,
        additional_comments: additionalFormValues?.additional_comments ?? data.additional_comments,
      };
    
      updateStudentExtraDataMutation.mutate(updateData, {
        onSuccess: (updatedStudent) => {
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Student additional info is updated",
          });
    
          // Update the local state with the new data
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student
            )
          );
    
          // Reset the additional form values
          setAdditionalFormValues(undefined);
          setInterventionDate(undefined);
        },
        onError: (error) => {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
        },
      });
    };

    const studentMeetings = allMeetings?.filter((meeting) =>
      meeting.MeetingAttendees?.some(
        (attendee) => attendee.student_id === data.id
      )
    );

    const getLatestLevelLesson = (meetingAttendees: MeetingAttendees[]) => {
      if (!meetingAttendees || meetingAttendees.length === 0) {
        return null;
      }

      const filteredMeetings = meetingAttendees.filter(
        (attendee) => attendee.Meetings && attendee.Meetings.level_lesson
      );

      if (filteredMeetings.length === 0) {
        return data.level_lesson || "N/A";
      }

      const sortedMeetings = filteredMeetings.sort((a, b) => {
        const dateA = a.Meetings?.start
          ? new Date(a.Meetings.start as string | number | Date)
          : new Date(0);
        const dateB = b.Meetings?.start
          ? new Date(b.Meetings.start as string | number | Date)
          : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      return sortedMeetings[0]?.Meetings?.level_lesson || "N/A";
    };

    const latestLevelLesson = getLatestLevelLesson(data.MeetingAttendees || []);

    return (
      <>
        <div className="expansion-row flex flex-row gap-3">
          <Card className="expansion-row__item w-6">
            <h3>Additional Info</h3>
            <div className="flex gap-4">
              <TextField
                required
                error={!data?.level_lesson}
                id="outlined-multiline-flexible"
                value={additionalFormValues?.level_lesson ?? data?.level_lesson?.toString() ?? ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setAdditionalFormValues({
                    ...additionalFormValues,
                    level_lesson: newValue,
                  })
                  setStudents(prevStudents =>
                    prevStudents.map(student =>
                      student.id === data.id
                        ? { ...student, level_lesson: newValue }
                        : student
                    )
                  )}
                }
                label="Beginning Level/Lesson"
                className="w-12"
                inputProps={{
                  readOnly: !session?.user.role
                    .split(",")
                    .map((role) => role.trim())
                    .some((role) => ["Admin", "Principal"].includes(role)),
                }}
              />
              <TextField
                id="outlined-multiline-flexible"
                value={latestLevelLesson || ''}
                label="Current Level/Lesson"
                className="w-12"
                inputProps={{
                  readOnly: true,
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
                value={data?.new_location || ''}
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
              value={additionalFormValues?.additional_comments ?? data?.additional_comments ?? ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setAdditionalFormValues(prev => ({
                  ...prev,
                  additional_comments: newValue,
                }));
                setStudents(prevStudents =>
                  prevStudents.map(student =>
                    student.id === data.id
                      ? { ...student, additional_comments: newValue }
                      : student
                  )
                );
              }}
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateClick}
              >
                Save
              </Button>
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
            meetings={studentMeetings}
            setMeetings={setMeetings}
            students={myStudents}
            studentId={data.id ?? 0}
            myDatedMeetings={studentMeetings}
            setMyDatedMeetings={() => studentMeetings}
            selectedMeetings={selectedMeetings}
            setSelectedMeetings={setSelectedMeetings}
            selectedDate={studentDates[data.id ?? 0] || selectedDate}
            datedMeetingsWithAttendees={datedMeetingsWithAttendees}
            setDatedMeetingsWithAttendees={setDatedMeetingsWithAttendees}
            selectedMeetingAttendees={selectedMeetingAttendees}
            isOnStudentsPage={isOnStudentsPage}
            isOnMeetingsPage={false}
            setAllMeetings={setAllMeetings}
          />
          <MeetingList
            meetings={studentMeetings}
            students={myStudents}
            studentId={data.id ?? 0}
            selectedDate={studentDates[data.id ?? 0] || selectedDate}
            setSelectedDate={(date) => handleStudentDateChange(date, data.id ?? 0)}
            selectedMeetings={selectedMeetings}
            setSelectedMeetings={setSelectedMeetings}
            datedMeetingsWithAttendees={datedMeetingsWithAttendees}
            isOnStudentsPage={isOnStudentsPage}
            isOnMeetingsPage={false}
          />
        </div>
      </>
    );
  };

  const deleteStudentMutation = api.students.deleteStudent.useMutation();
  const handleDeleteStudent = (studentId: number) => {
    const id = studentId || 0;
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
                deleteStudentMutation.mutate(
                  { id: id },
                  {
                    onSuccess: (response) => {
                      toastDelete.current?.clear();

                      if (response) {
                        setStudents((students) =>
                          students.filter((student) => student.id !== id)
                        );

                        toast.current?.show({
                          severity: "success",
                          summary: "Success",
                          detail: "Student added",
                        });
                      }
                    },
                    onError: (error) => {
                      console.log("error", error);
                      toastDelete.current?.clear();
                      if (deleteStudentMutation.isError) {
                        console.error("Error deleting student.");
                        toast.current?.show({
                          severity: "error",
                          summary: "Error",
                          detail: "Delete failed",
                        });
                      }
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

  const exportColumns: ExportColumn[] = [
    { title: "Student ID", dataKey: "student_assigned_id" },
    { title: "First Name", dataKey: "first_name" },
    { title: "Last Name", dataKey: "last_name" },
    { title: "School", dataKey: "school" },
    { title: "Grade", dataKey: "grade" },
    { title: "Home Room Teacher", dataKey: "home_room_teacher" },
    { title: "Program", dataKey: "intervention_program" },
    { title: "Tutor", dataKey: "tutorFullName" },
    { title: "Services", dataKey: "services" },
    { title: "Additional Comments", dataKey: "additional_comments" },
  ];

  // const exportPdf = () => {
  //   try {
  //     const doc = new jsPDF();

  //     const head = [exportColumns.map((col) => col.title)];
  //     const body = filteredStudents.map((student) =>
  //       exportColumns.map((col) => student[col.dataKey]?.toString() ?? "")
  //     );

  //     autoTable(doc, {
  //       head,
  //       body,
  //     });

  //     doc.save("students.pdf");
  //   } catch (error) {
  //     console.error("Error exporting PDF file:", error);
  //   }
  // };

  // const handleExportPdf = () => {
  //   exportPdf();
  // };

  const exportCSV = (selectionOnly = false): void => {
    if (dt.current) {
      dt.current.exportCSV({ selectionOnly });
    } else {
      console.error("DataTable reference is null.");
    }
  };

  const exportExcel = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const worksheet: WorkSheet = XLSXUtils.json_to_sheet(
          filteredStudents.map((student) => {
            const result: Record<string, string> = {};
            exportColumns.forEach((col) => {
              const value = student[col.dataKey];
              result[col.title] =
                value !== null && value !== undefined ? value.toString() : "";
            });
            return result;
          })
        );
        const workbook: WorkBook = {
          Sheets: { data: worksheet },
          SheetNames: ["data"],
        };
        const excelBuffer: ArrayBuffer = XLSXWrite(workbook, {
          bookType: "xlsx",
          type: "array",
        }) as ArrayBuffer;

        saveAsExcelFile(excelBuffer, "students").then(resolve).catch(reject);
      } catch (error) {
        console.error("Error exporting Excel file:", error);
        reject(error);
      }
    });
  };

  const saveAsExcelFile = async (
    buffer: ArrayBuffer,
    fileName: string
  ): Promise<void> => {
    try {
      const fileSaverModule = await import("file-saver");
      if (fileSaverModule && fileSaverModule.default) {
        const EXCEL_TYPE =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], { type: EXCEL_TYPE });

        fileSaverModule.default.saveAs(
          data,
          `${fileName}_export_${new Date().getTime()}${EXCEL_EXTENSION}`
        );
      }
    } catch (error) {
      console.error("Error saving Excel file:", error);
    }
  };

  const handleExportExcel = () => {
    exportExcel().catch((error) => {
      console.error("Error in handleExportExcel:", error);
    });
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-row justify-content-between">
        <div className="flex justify-content-start">
          <div className="flex align-items-center gap-2">
            {session?.user.role !== "Tutor" && (
              <Button onClick={handleOpen} variant="contained">
                Add
              </Button>
            )}
            <Button onClick={expandAll} variant="outlined">
              Expand All
            </Button>
            <Button onClick={collapseAll} variant="outlined">
              Collapse All
            </Button>
          </div>
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
        {/* </div>
        <div className="flex align-items-center justify-content-end gap-2"> */}
          <IconButton onClick={() => exportCSV(false)} aria-label="CSV">
            <TextSnippet />
          </IconButton>
          <IconButton onClick={handleExportExcel} aria-label="XLS">
            <TableRows />
          </IconButton>
          {/* <IconButton onClick={handleExportPdf} aria-label="PDF">
            <PictureAsPdf />
          </IconButton> */}
        </div>
      </div>
    );
  };
  const header = renderHeader();

  if (!getAllStudents.data)
    return (
      <div className="flex w-full h-full">
        <CircularProgress
          color="primary"
          className="flex align-items-center justify-content-center"
        />
      </div>
    );

  const newRowClass = (data: Student) => {
    return {
      "bg-green-50":
        data.new_student === true && data.id !== undefined && data.id > -2,
      "bg-red-100": data.first_name === "",
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
          <IconButton
            onClick={(e) =>
              isFormValid[rowData.id as number] &&
              options.rowEditor?.onSaveClick &&
              options.rowEditor?.onSaveClick(e)
            }
            color={isFormValid[rowData.id as number] ? "primary" : "default"}
            disabled={!isFormValid[rowData.id as number]}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            onClick={(e) =>
              options.rowEditor?.onCancelClick &&
              options.rowEditor?.onCancelClick(e)
            }
            color="error"
          >
            <CloseIcon />
          </IconButton>
        </div>
      ) : (
        <div className="flex gap-1 justify-content-center">
          <IconButton
            onClick={(e) => {
              checkFormValidity(rowData);
              options.rowEditor?.onInitClick &&
              options.rowEditor?.onInitClick(e);
            }}
          >
            <CreateIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              if (rowData.id && rowData.id < 0) {
                setStudents((prevStudents) =>
                  prevStudents.filter((student) => student.id !== rowData.id)
                );
              } else if (rowData.id && rowData.id > 0) {
                const studentId = rowData.id;
                handleDeleteStudent(studentId);
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )}
    </>
  );
  
  return (
    <>
      <AddStudentForm
        session={session}
        users={users}
        setUsers={setUsers}
        students={students}
        setStudents={setStudents}
        open={open}
        setOpen={setOpen}
        runSuccessToast={runSuccessToast}
        setRunSuccessToast={setRunSuccessToast}
      />

      <Card className="card">
        <Toast ref={toast} />
        <Toast ref={toastDelete} position="top-center" />
        <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
          <h3>Students</h3>
        </div>

        <DataTable
          // key={students.map(s => `${s.id || 0}-${s.tutorId || 'unassigned'}`).join('-')}
          className="students-table"
          ref={dt}
          value={students}
          editMode="row"
          editingRows={editingRows}
          onRowEditComplete={onRowEditComplete}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          stripedRows
          removableSort
          rowClassName={newRowClass}
          // onRowSelect={rowSelected}
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
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
        >
          <Column
            expander={allowExpansion}
            style={{ width: "5rem" }}
            header="Expand"
          />
          <Column
            field="student_assigned_id"
            header="Student ID #"
            editor={(options) => studentIdEditor(options)}
            sortable
          />
          <Column
            field="first_name"
            header="First Name"
            editor={(options) => firstNameEditor(options)}
            sortable
          />
          <Column
            field="last_name"
            header="Last Name"
            editor={(options) => lastNameEditor(options)}
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
            editor={(options) => teacherEditor(options)}
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
            body={tutorBodyTemplate}
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
    </>
  );
};


export default Students;
