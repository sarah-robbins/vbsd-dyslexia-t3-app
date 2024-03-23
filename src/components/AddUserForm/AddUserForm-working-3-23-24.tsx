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
import { User, type customSession } from "@/types";
import { type Session } from "next-auth";
import { api } from "@/utils/api";
import { Toast } from "primereact/toast";

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
}

const isCustomSession = (session: Session | null): session is customSession => {
  return (
    session !== null && typeof session === "object" && "appSettings" in session
  );
};

const AddUserForm: React.FC<Props> = ({
  session,
  users,
  setUsers = () => {
    users;
  },
}) => {
  const toast = useRef<Toast>(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [userSchools, setUserSchools] = React.useState<string[]>([]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [name]: value,
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
  };

  const [userView, setUserView] = React.useState("");

  const handleViewChange = (event: SelectChangeEvent) => {
    setUserView(event.target.value);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      view: event.target.value,
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

  const saveNewUser = () => {
    console.log("Form Data is: ", formValues);
    createUserMutation.mutate(formValues, {
      onSuccess: (response) => {
        if (response.id) {
          const newUser: User = {
            id: response.id,
            ...formValues,
          };
          console.log("New User added from form.");
          if (newUser) {
            users.push(newUser);
            console.log("New User added to db: ", newUser);
          }
        } else {
          console.log("no id returned from the server");
        }

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User saved",
        });

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

  if (!session || !isCustomSession(session)) {
    return null;
  }
  return (
    <>
      <Button onClick={handleOpen}>Open User modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          className="flex flex-column flex-wrap sm:flex-row justify-content-start align-items-stretch"
        >
          <h2 className="mb-4">Add User</h2>
          <div className="flex flex-column flex-wrap sm:flex-row gap-4 justify-content-center align-items-stretch">
            <FormControl className="form-fields form-fields-50">
              <TextField
                required
                name="first_name"
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
            <FormControl required className="w-full">
              <InputLabel id="demo-simple-select-label">Schools</InputLabel>
              <Select
                // labelId="demo-multiple-checkbox-label"
                // id="demo-multiple-checkbox"
                multiple
                value={userSchools}
                label="School"
                onChange={handleSchoolChange}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {session.appSettings.school_options.map((school) => (
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
                // labelId="demo-multiple-checkbox-label"
                // id="demo-multiple-checkbox"
                multiple
                value={userRoles}
                label="Role"
                onChange={handleRolesChange}
                // input={<OutlinedInput label="Tag" />}
                renderValue={(selected) => selected.join(", ")}
                // MenuProps={MenuProps}
              >
                {session.appSettings.user_role_options.map((role) => (
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
                // labelId="demo-simple-select-label"
                // id="demo-simple-select"
                value={userView}
                label="View"
                onChange={handleViewChange}
              >
                {session.appSettings.initial_view_options.map((view) => (
                  <MenuItem key={view} value={view}>
                    <ListItemText primary={view} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Button variant="contained" onClick={saveNewUser} className="mt-4">
            Add User
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default AddUserForm;
