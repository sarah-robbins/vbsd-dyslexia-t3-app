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
import { type Dayjs } from "dayjs";
import Autocomplete from "@mui/material/Autocomplete";
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
  // setUsers,
  students,
  open,
  setOpen,
  setRunSuccessToast,
}) => {
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
    setStudentTutor(null);
    setStudentServices([]);
    setStudentDate(null);
    setIsFormValid(false);
    setTouched({});
  };

  const [studentSchool, setStudentSchool] = React.useState<string>("");
  const [studentGrade, setStudentGrade] = React.useState<string>("");
  const [studentProgram, setStudentProgram] = React.useState<string>("");
  const [studentTutor, setStudentTutor] = React.useState<number | null>(null);
  const [studentServices, setStudentServices] = React.useState<string[]>([]);
  const [studentDate, setStudentDate] = React.useState<Dayjs | null>(null);
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

  const [isFormValid, setIsFormValid] = React.useState<boolean>(false);
  const [touched, setTouched] = React.useState<{ [key: string]: boolean }>({});

  const checkFormValidity = (formValues: formValues) => {
    const isValid = !!(
      formValues.student_assigned_id &&
      formValues.first_name &&
      formValues.last_name &&
      formValues.school &&
      formValues.grade &&
      formValues.intervention_program &&
      formValues.services
    );

    setIsFormValid(isValid);
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => {
      const updatedFormValues = { ...prevFormValues, [name]: value };
      checkFormValidity(updatedFormValues);
      return updatedFormValues;
    });
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = event.target;
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    checkFormValidity(formValues); // Ensure form validity is checked on blur
  };

  // Generate options based on the user role
  let schoolOptions: string[];
  if (session?.user.role.toLowerCase().includes("admin")) {
    schoolOptions = (
      session as customSession
    )?.appSettings.school_options.sort();
  } else if (session?.user.role.toLowerCase().includes("principal")) {
    schoolOptions = session.user.school
      .split(",")
      .map((school) => school.trim())
      .sort();
  } else {
    schoolOptions = []; // Ensure there's always a fallback
  }

  const handleSchoolChange = (newValue: string | null) => {
    if (newValue) {
      setStudentSchool(newValue);
      setFormValues((prevFormValues) => {
        const updatedFormValues = {
          ...prevFormValues,
          school: newValue?.toString() || "",
        };
        checkFormValidity(updatedFormValues);
        return updatedFormValues;
      });
    }
  };

  // Generate options based on the user role
  let gradeOptions: string[];
  if ((session as customSession)?.appSettings.grade_options) {
    gradeOptions = (session as customSession)?.appSettings.grade_options;
  } else {
    gradeOptions = []; // Ensure there's always a fallback
  }

  const handleGradeChange = (newValue: string | null) => {
    if (newValue) {
      setStudentGrade(newValue);
      setFormValues((prevFormValues) => {
        const updatedFormValues = {
          ...prevFormValues,
          grade: newValue,
        };
        checkFormValidity(updatedFormValues);
        return updatedFormValues;
      });
    }
  };

  const handleProgramChange = (event: SelectChangeEvent) => {
    setStudentProgram(event.target.value);
    setFormValues((prevFormValues) => {
      const updatedFormValues = {
        ...prevFormValues,
        intervention_program: event.target.value,
      };
      checkFormValidity(updatedFormValues);
      return updatedFormValues;
    });
  };

  const handleTutorChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value === "unassigned") {
      setStudentTutor(null);
      setFormValues((prevFormValues) => {
        const updatedFormValues = {
          ...prevFormValues,
          tutor_id: null,
          tutorId: null,
          tutorInfo: undefined,
        };
        return updatedFormValues;
      });
    } else {
      const tutorId = Number(value);
      setStudentTutor(tutorId);
      const tutor = users.find((user) => user.id === tutorId);
      const tutorName = `${tutor?.first_name || ""} ${tutor?.last_name || ""}`;
      setFormValues((prevFormValues) => {
        const updatedFormValues = {
          ...prevFormValues,
          tutor_id: tutorId,
          tutorId: tutorId,
          tutorInfo: {
            value: tutorId,
            label: tutorName,
          },
        };
        return updatedFormValues;
      });
    }
  };

  const handleServicesChange = (
    event: SelectChangeEvent<typeof studentServices>
  ) => {
    const {
      target: { value },
    } = event;
    setStudentServices(typeof value === "string" ? value.split(",") : value);
    setFormValues((prevFormValues) => {
      const updatedFormValues = {
        ...prevFormValues,
        services: typeof value === "string" ? value : value.join(","),
      };
      checkFormValidity(updatedFormValues);
      return updatedFormValues;
    });
  };

  const handleDateChange = (date: Dayjs | null) => {
    setStudentDate(date);
    if (date) {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        date_intervention_began: date.toDate(), // Convert Dayjs to Date
      }));
    } else {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        date_intervention_began: null, // Set to null when no date is selected
      }));
    }
  };

  const createStudentMutation = api.students.createStudent.useMutation();

  const saveNewStudent = () => {
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
    createStudentMutation.mutate(updatedFormValues, {
      onSuccess: (response) => {
        if (response.id) {
          const newStudent: Student = {
            ...updatedFormValues,
            id: response.id,
          };
          if (newStudent) {
            students.push(newStudent);
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
          setStudentTutor(null);
          setStudentServices([]);
          setStudentDate(null);
          setIsFormValid(false);
          setTouched({});
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
              error={touched.student_assigned_id && !formValues.student_assigned_id}
              helperText={
                touched.student_assigned_id && !formValues.student_assigned_id ? "Student ID is required" : ""
              }
              name="student_assigned_id"
              label="Student ID"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              error={touched.first_name && !formValues.first_name}
              helperText={
                touched.first_name && !formValues.first_name ? "First name is required" : ""
              }
              name="first_name"
              id="outlined-basic"
              label="First Name"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              error={touched.last_name && !formValues.last_name}
              helperText={touched.last_name && !formValues.last_name ? "Last name is required" : ""}
              name="last_name"
              id="outlined-basic"
              label="Last Name"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
            />
          </FormControl>

          <FormControl className="form-fields form-fields-50">
            <Autocomplete
              disablePortal
              id="school-autocomplete"
              options={schoolOptions}
              value={studentSchool} // Ensure this is managed correctly in your state
              onChange={(event, newValue) => {
                handleSchoolChange(newValue); // Adapt this handler as necessary
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="School"
                  required
                  error={touched.school && !formValues.school}
                  onBlur={() => {
                    setTouched((prevTouched) => ({ ...prevTouched, school: true }));
                    checkFormValidity(formValues);
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <Autocomplete
              disablePortal
              id="grade-autocomplete"
              options={gradeOptions}
              value={studentGrade} // Ensure this is managed correctly in your state
              onChange={(event, newValue) => {
                handleGradeChange(newValue); // Adapt this handler as necessary
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Grade"
                  required
                  error={touched.grade && !formValues.grade}
                  onBlur={() => {
                    setTouched((prevTouched) => ({ ...prevTouched, grade: true }));
                    checkFormValidity(formValues);
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              name="home_room_teacher"
              id="outlined-basic"
              label="Home Room Teacher"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl
            required
            error={touched.intervention_program && !formValues.intervention_program}
            className="form-fields form-fields-50"
          >
            <InputLabel id="demo-simple-select-label">Program</InputLabel>
            <Select
              value={studentProgram}
              label="Program"
              onChange={handleProgramChange}
              onBlur={() => {
                setTouched((prevTouched) => ({ ...prevTouched, intervention_program: true }));
                checkFormValidity(formValues);
              }}
            >
              {session.appSettings.program_options.sort().map((program) => (
                <MenuItem key={program} value={program}>
                  <ListItemText primary={program} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            className="form-fields form-fields-50"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: studentTutor === null ? "orange" : "default",
                },
                "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: studentTutor === null ? "orange" : "default",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: studentTutor === null ? "orange" : "default",
                },
              },
            }}
          >
            <InputLabel id="demo-simple-select-label">Tutor</InputLabel>
            <Select
              value={studentTutor !== null ? studentTutor.toString() : "unassigned"}
              label="Tutor"
              onChange={handleTutorChange}
              onBlur={() => {
                setTouched((prevTouched) => ({ ...prevTouched, tutor_id: true }));
              }}
            >
              <MenuItem value="unassigned">
                <ListItemText primary="Unassigned" />
              </MenuItem>
              {users
                .sort((a, b) => {
                  const lastNameA = (a.last_name || "").toUpperCase();
                  const lastNameB = (b.last_name || "").toUpperCase();
                  if (lastNameA < lastNameB) {
                    return -1;
                  }
                  if (lastNameA > lastNameB) {
                    return 1;
                  }
                  return 0;
                })
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <ListItemText
                      primary={`${user.first_name || ""} ${user.last_name || ""}`}
                    />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl required error={touched.services && !formValues.services} className="w-full">
            <InputLabel id="demo-simple-select-label">Services</InputLabel>
            <Select
              multiple
              value={studentServices}
              label="Service"
              onChange={handleServicesChange}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
              onBlur={() => {
                setTouched((prevTouched) => ({ ...prevTouched, services: true }));
                checkFormValidity(formValues);
              }}
            >
              {session.appSettings.services_options.sort().map((service) => (
                <MenuItem key={service} value={service}>
                  <Checkbox checked={studentServices.indexOf(service) > -1} />
                  <ListItemText primary={service} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              name="level_lesson"
              label="Level/Lesson"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
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
              multiline
              maxRows={4}
              name="additional_comments"
              label="Additional Comments"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
            />
          </FormControl>
        </div>
        <div className="mt-4 form-button-container flex gap-4">
          <Button
            variant="contained"
            onClick={saveNewStudent}
            disabled={!isFormValid}
          >
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
