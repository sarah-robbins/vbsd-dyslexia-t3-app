import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import React, { useRef, type ChangeEvent } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import type { Student, User, customSession } from "@/types";
import { type Session } from "next-auth";
import { api } from "@/utils/api";
import { type Toast } from "primereact/toast";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
// import Autocomplete from "@mui/material/Autocomplete";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface formValues {
  id?: number;
  student_assigned_id?: string;
  school?: string;
  first_name?: string;
  last_name?: string;
  grade?: string;
  home_room_teacher?: string;
  tutor_id?: number | null;
  intervention_program?: string;
  level_lesson?: string;
  date_intervention_began?: Date | null;
  services?: string;
  new_student?: boolean;
  graduated?: boolean;
  moved?: boolean;
  new_location?: string;
  withdrew?: boolean;
  additional_comments?: string;
  created_at?: Date;
  tutorId?: number | null;
  tutorFullName?: string;
  tutorInfo?: {
    value: number;
    label: string;
  };
}

interface Props {
  session: Session | null;
  users: User[];
  setUsers: (users: User[]) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  runSuccessToast: boolean;
  setRunSuccessToast: (runSuccessToast: boolean) => void;
}

const isCustomSession = (session: Session | null): session is customSession => {
  return (
    session !== null && typeof session === "object" && "appSettings" in session
  );
};

const AddStudentForm: React.FC<Props> = ({
  session,
  users,
  setUsers,
  students,
  open,
  setOpen,
  setRunSuccessToast,
}) => {
  console.log("users from AddStudentForm", users);
  const toast = useRef<Toast>(null);
  const handleClose = () => {
    setOpen(false),
      setFormValues({
        first_name: "",
        last_name: "",
        student_assigned_id: "",
        school: "",
        grade: "",
        home_room_teacher: "",
        intervention_program: "",
        date_intervention_began: null,
        tutor_id: null,
        services: "",
        level_lesson: "",
        new_student: true,
        withdrew: false,
        graduated: false,
        moved: false,
        new_location: "",
        additional_comments: "",
        created_at: new Date(),
      });
    setStudentSchool("");
    setStudentGrade("");
    setStudentProgram("");
    setStudentTutor(undefined);
    setStudentServices([]);
    setStudentDate(null);
  };

  const [studentSchool, setStudentSchool] = React.useState<string>("");
  const [studentGrade, setStudentGrade] = React.useState<string>("");
  const [studentProgram, setStudentProgram] = React.useState<string>("");
  const [studentTutor, setStudentTutor] = React.useState<number>();
  const [studentServices, setStudentServices] = React.useState<string[]>([]);
  const [studentDate, setStudentDate] = React.useState<Dayjs | null>(null); // Initialize to null

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [name]: value,
    }));
  };

  const handleSchoolChange = (event: SelectChangeEvent) => {
    setStudentSchool(event.target.value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      school: event.target.value?.toString() || "",
    }));
  };

  const handleGradeChange = (event: SelectChangeEvent) => {
    setStudentGrade(event.target.value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      grade: event.target.value,
    }));
  };

  const handleProgramChange = (event: SelectChangeEvent) => {
    setStudentProgram(event.target.value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      intervention_program: event.target.value,
    }));
  };

  const handleTutorChange = (event: SelectChangeEvent) => {
    setStudentTutor(Number(event.target.value));
    const tutor = users.find((user) => user.id === Number(event.target.value));
    console.log("tutor", tutor);
    const tutorName = `${tutor?.first_name || ""} ${tutor?.last_name || ""}`;
    console.log("tutorName", tutorName);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      tutor_id: Number(event.target.value),
      tutorId: Number(event.target.value),
      tutorInfo: {
        value: Number(event.target.value),
        label: tutorName,
      },
      user: tutor,
    }));
  };

  const handleServicesChange = (
    event: SelectChangeEvent<typeof studentServices>
  ) => {
    const {
      target: { value },
    } = event;
    setStudentServices(typeof value === "string" ? value.split(",") : value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      services: typeof value === "string" ? value : value.join(","),
    }));
  };

  const handleDateChange = (date: Dayjs | null) => {
    setStudentDate(date);
    if (date) {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        date_intervention_began: date.toDate(), // Convert Dayjs to Date
      }));
    } else {
      // setFormValues((prevFormValues) => ({
      //   ...prevFormValues,
      //   date_intervention_began: null, // Set to null when no date is selected
      // }));
    }
  };

  const [formValues, setFormValues] = React.useState<formValues>({
    first_name: "",
    last_name: "",
    student_assigned_id: "",
    school: "",
    grade: "",
    home_room_teacher: "",
    intervention_program: "",
    date_intervention_began: null,
    tutor_id: null,
    services: "",
    level_lesson: "",
    new_student: true,
    withdrew: false,
    graduated: false,
    moved: false,
    new_location: "",
    additional_comments: "",
    created_at: new Date(),
  });

  const createStudentMutation = api.students.createStudent.useMutation();

  const saveNewStudent = () => {
    console.log("formValues", formValues);
    const tutor = users.find((user) => user.id === Number(studentTutor));

    const tutorName = `${tutor?.first_name || ""} ${tutor?.last_name || ""}`;

    let updatedFormValues = {
      ...formValues,
      date_intervention_began: studentDate?.toDate(),
    };
    if (studentTutor) {
      updatedFormValues = {
        ...formValues,
        date_intervention_began: studentDate?.toDate(),
        tutorId: studentTutor,
        tutor_id: studentTutor,
        tutorInfo: {
          value: studentTutor,
          label: tutorName,
        },
        tutorFullName: tutorName,
      };
    }
    console.log("updatedFormValues", updatedFormValues);
    createStudentMutation.mutate(updatedFormValues, {
      onSuccess: (response) => {
        if (response.id) {
          const newStudent: Student = {
            ...updatedFormValues,
            id: response.id,
          };
          if (newStudent) {
            students.push(newStudent);

            // // This is the correct way to update the state, but it's not working
            // setStudents(prevStudents => [newStudent, ...prevStudents]);
          }
          setOpen(false);
          setRunSuccessToast(true);
          setFormValues({
            first_name: "",
            last_name: "",
            student_assigned_id: "",
            school: "",
            grade: "",
            home_room_teacher: "",
            intervention_program: "",
            date_intervention_began: null,
            tutor_id: null,
            services: "",
            level_lesson: "",
            new_student: true,
            withdrew: false,
            graduated: false,
            moved: false,
            new_location: "",
            additional_comments: "",
            created_at: new Date(),
          });
          setStudentSchool("");
          setStudentGrade("");
          setStudentProgram("");
          setStudentTutor(undefined);
          setStudentServices([]);
          setStudentDate(null);
          // setUsers(users);

          // Return an empty array or the current array of students
          // return [];
        } else {
          console.log("no id returned from the server");
        }
      },
      onError: (error) => {
        console.log("error", error);
        // On error, show an error toast
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Save failed",
        });

        // Return an empty array or the current array of students
        return [];
      },
    });
  };

  if (!session || !isCustomSession(session)) {
    return null;
  }
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={style}
        className="form-container flex flex-column flex-wrap sm:flex-row justify-content-start align-items-stretch"
      >
        <div className="modal-header flex justify-content-between align-items-center w-full mb-4">
          <h2>Add Student</h2>
          <Button color="error" onClick={handleClose}>
            <CloseIcon color="error" className="close-icon" />
          </Button>
        </div>
        <div className="flex flex-column flex-wrap sm:flex-row gap-4 justify-content-center align-items-stretch">
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="student_assigned_id"
              label="Student ID"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="first_name"
              id="outlined-basic"
              label="First Name"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="last_name"
              id="outlined-basic"
              label="Last Name"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
          {/* <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={mySchools}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="School" />}
          /> */}
          <FormControl required className="form-fields form-fields-50">
            <InputLabel id="demo-simple-select-label">School</InputLabel>
            <Select
              value={studentSchool}
              label="School"
              onChange={handleSchoolChange}
            >
              {session.user.role.toLowerCase().includes("admin")
                ? session.appSettings.school_options.map((school) => (
                    <MenuItem key={school} value={school}>
                      <ListItemText primary={school} />
                    </MenuItem>
                  ))
                : session.user.role.toLowerCase().includes("principal")
                ? session.user.school.split(",").map((school) => (
                    <MenuItem key={school.trim()} value={school.trim()}>
                      <ListItemText primary={school.trim()} />
                    </MenuItem>
                  ))
                : null}
            </Select>
          </FormControl>{" "}
          <FormControl required className="form-fields form-fields-50">
            <InputLabel id="demo-simple-select-label">Grade</InputLabel>
            <Select
              // labelId="demo-simple-select-label"
              // id="demo-simple-select"
              value={studentGrade}
              label="Grade"
              onChange={handleGradeChange}
            >
              {session.appSettings.grade_options.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  <ListItemText primary={grade} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="home_room_teacher"
              id="outlined-basic"
              label="Home Room Teacher"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
          <FormControl required className="form-fields form-fields-50">
            <InputLabel id="demo-simple-select-label">Program</InputLabel>
            <Select
              // labelId="demo-simple-select-label"
              // id="demo-simple-select"
              value={studentProgram}
              label="Program"
              onChange={handleProgramChange}
            >
              {session.appSettings.program_options.map((program) => (
                <MenuItem key={program} value={program}>
                  <ListItemText primary={program} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required className="form-fields form-fields-50">
            <InputLabel id="demo-simple-select-label">Tutor</InputLabel>
            <Select
              // labelId="demo-simple-select-label"
              // id="demo-simple-select"
              value={studentTutor?.toString()}
              label="Tutor"
              onChange={handleTutorChange}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <ListItemText
                    primary={`${user.first_name || ""} ${user.last_name || ""}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required className="w-full">
            <InputLabel id="demo-simple-select-label">Services</InputLabel>
            <Select
              // labelId="demo-multiple-checkbox-label"
              // id="demo-multiple-checkbox"
              multiple
              value={studentServices}
              label="Service"
              onChange={handleServicesChange}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {session.appSettings.services_options.map((service) => (
                <MenuItem key={service} value={service}>
                  <Checkbox checked={studentServices.indexOf(service) > -1} />
                  <ListItemText primary={service} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="level_lesson"
              label="Level/Lesson"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date Intervention Began"
                className="w-12"
                value={studentDate}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl className="form-fields w-full">
            <TextField
              required
              multiline
              maxRows={4}
              name="additional_comments"
              label="Additional Comments"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
        </div>
        <div className="mt-4 form-button-container flex gap-4">
          <Button variant="contained" onClick={saveNewStudent}>
            Add Student
          </Button>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default AddStudentForm;
