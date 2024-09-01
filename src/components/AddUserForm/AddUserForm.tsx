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
import type { User, customSession } from "@/types";
import { type Session } from "next-auth";
import { api } from "@/utils/api";
import { type Toast } from "primereact/toast";
import CloseIcon from "@mui/icons-material/Close";
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

interface FormValues {
  first_name: string;
  last_name: string;
  school: string;
  email: string;
  phone: string;
  role: string;
  view: string;
  created_at: Date;
}

interface Props {
  session: Session | null;
  users: User[];
  setUsers: (users: User[]) => void;
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

const AddUserForm: React.FC<Props> = ({
  session,
  users,
  open,
  setOpen,
  setRunSuccessToast,
}) => {
  const toast = useRef<Toast>(null);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormValues({
      first_name: "",
      last_name: "",
      school: "",
      email: "",
      phone: "",
      role: "",
      view: "",
      created_at: new Date(),
    });
    setTouchedFields({
      first_name: false,
      last_name: false,
      school: false,
      email: false,
      role: false,
      view: false,
    });
    setUserSchools([]);
    setUserRoles([]);
    setUserView("");
  };

  const [userSchools, setUserSchools] = React.useState<string[]>([]);

  const [touchedFields, setTouchedFields] = React.useState({
    first_name: false,
    last_name: false,
    school: false,
    email: false,
    role: false,
    view: false,
  });

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [name]: value,
    }));
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [name]: true,
    }));
  };

  const handleSchoolChange = (event: SelectChangeEvent<typeof userSchools>) => {
    const {
      target: { value },
    } = event;
    setUserSchools(typeof value === "string" ? value.split(",") : value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      school: typeof value === "string" ? value : value.join(","),
    }));
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      school: true,
    }));
  };

  const [userRoles, setUserRoles] = React.useState<string[]>([]);

  const handleRolesChange = (event: SelectChangeEvent<typeof userRoles>) => {
    const {
      target: { value },
    } = event;
    setUserRoles(typeof value === "string" ? value.split(",") : value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      role: typeof value === "string" ? value : value.join(","),
    }));
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      role: true,
    }));
  };

  const [userView, setUserView] = React.useState("");

  const handleViewChange = (event: SelectChangeEvent) => {
    setUserView(event.target.value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      view: event.target.value,
    }));
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      view: true,
    }));
  };

  const [formValues, setFormValues] = React.useState<FormValues>({
    first_name: "",
    last_name: "",
    school: "",
    email: "",
    phone: "",
    role: "",
    view: "",
    created_at: new Date(),
  });

  const createUserMutation = api.users.createUser.useMutation();

  const isFormValid = () => {
    return (
      formValues.first_name &&
      formValues.last_name &&
      formValues.school &&
      formValues.email &&
      formValues.role &&
      formValues.view
    );
  };

  const saveNewUser = () => {
    createUserMutation.mutate(formValues, {
      onSuccess: (response) => {
        if (response.id) {
          const newUser: User = {
            id: response.id,
            ...formValues,
          };
          if (newUser) {
            users.push(newUser);

            // // This is the correct way to update the state, but it's not working
            // setUsers(prevUsers => [newUser, ...prevUsers]);
          }
        } else {
          console.log("no id returned from the server");
        }
        setOpen(false);
        setRunSuccessToast(true);
        resetForm();
        // Return an empty array or the current array of users
        return [];
      },
      onError: (error) => {
        console.log("error", error);
        // On error, show an error toast
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Save failed",
        });

        // Return an empty array or the current array of users
        return [];
      },
    });
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = event.target;
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [name]: true,
    }));
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
        className="form-container flex flex-column max-w-1024 justify-content-start align-items-stretch"
      >
        <div className="modal-header flex justify-content-between align-items-center w-full mb-4">
          <h2>Add User</h2>
          <Button onClick={handleClose} color="error">
            <CloseIcon className="close-icon" />
          </Button>
        </div>
        <div className="flex flex-column flex-wrap sm:flex-row gap-4 justify-content-center align-items-stretch">
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="first_name"
              label="First Name"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
              error={touchedFields.first_name && !formValues.first_name}
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
              onBlur={handleBlur}
              error={touchedFields.last_name && !formValues.last_name}
            />
          </FormControl>
          <FormControl required className="w-full">
            <InputLabel id="demo-simple-select-label">Schools</InputLabel>
            <Select
              multiple
              value={userSchools}
              label="School"
              onChange={handleSchoolChange}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, school: true }))}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
              error={touchedFields.school && !formValues.school}
            >
              {session.appSettings.school_options.sort().map((school) => (
                <MenuItem key={school} value={school}>
                  <Checkbox checked={userSchools.indexOf(school) > -1} />
                  <ListItemText primary={school} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              required
              name="email"
              label="Email"
              variant="outlined"
              onChange={handleTextChange}
              onBlur={handleBlur}
              error={touchedFields.email && !formValues.email}
            />
          </FormControl>
          <FormControl className="form-fields form-fields-50">
            <TextField
              name="phone"
              label="Phone Number"
              variant="outlined"
              onChange={handleTextChange}
            />
          </FormControl>
          <FormControl required className="form-fields form-fields-50">
            <InputLabel id="demo-simple-select-label">Roles</InputLabel>
            <Select
              multiple
              value={userRoles}
              label="Role"
              onChange={handleRolesChange}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, role: true }))}
              renderValue={(selected) => selected.join(", ")}
              error={touchedFields.role && !formValues.role}
            >
              {session.appSettings.user_role_options.sort().map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={userRoles.indexOf(role) > -1} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl required className="form-fields form-fields-50">
            <InputLabel id="demo-simple-select-label">View</InputLabel>
            <Select
              value={userView}
              label="View"
              onChange={handleViewChange}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, view: true }))}
              error={touchedFields.view && !formValues.view}
            >
              {session.appSettings.initial_view_options.sort().map((view) => (
                <MenuItem key={view} value={view}>
                  <ListItemText primary={view} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="mt-4 form-button-container flex gap-4">
          <Button variant="contained" onClick={saveNewUser} disabled={!isFormValid()}>
            Add User
          </Button>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default AddUserForm;
