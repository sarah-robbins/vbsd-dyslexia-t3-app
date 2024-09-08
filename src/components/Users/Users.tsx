import React, { useState, useEffect, useRef } from "react";
import {
  DataTable,
  type DataTableRowEditCompleteEvent,
  type DataTableFilterMeta,
  type DataTableRowEditEvent,
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

import type { User, customSession } from "@/types";
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
import { useSession } from "next-auth/react";
// import { Button } from "primereact/button";
import Button from "@mui/material/Button";
import AddUserForm from "../AddUserForm";

const Users: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const [runSuccessToast, setRunSuccessToast] = React.useState(false);
  const toastDelete = useRef<Toast>(null);
  const toast = useRef<Toast>(null);

  // Show a success toast when the runSuccessToast state is true
  useEffect(() => {
    if (runSuccessToast === true) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "User saved",
      });
    }
  }, [runSuccessToast]);

  const [users, setUsers] = useState<User[]>([]);
  const { data: session } = useSession();
  const appSettings = (session as customSession)?.appSettings;
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    first_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    last_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    school: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.CONTAINS },
    view: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const getUsersForRole = api.users.getUsersForRole.useQuery() as {
    data: User[];
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  const myUsers = getUsersForRole.data;

  const processSchool = (
    school: string | string[] | null | undefined
  ): string[] => {
    if (Array.isArray(school)) {
      return school;
    } else if (typeof school === "string") {
      // Split the string by comma, then trim each element
      return school.split(",").map((sch) => sch.trim());
    } else {
      return [];
    }
  };

  const schoolsTemplate = (rowData: User) => {
    // Check if schools is an array
    if (Array.isArray(rowData.school)) {
      // Alphabetize the array of schools and then convert it to a comma-separated string
      return rowData.school.sort().join(", ");
    } else if (typeof rowData.school === "string") {
      // If school is a string, ensure it's formatted with spaces after commas
      return rowData.school
        .split(",")
        .map((s) => s.trim())
        .join(", ");
    }
    // If schools is a string, just return it as is
    return rowData.school;
  };

  const processRole = (
    roles: string | string[] | null | undefined
  ): string[] => {
    if (Array.isArray(roles)) {
      return roles;
    } else if (typeof roles === "string") {
      // Split the string by comma, then trim each element
      return roles.split(",").map((role) => role.trim());
    } else {
      return [];
    }
  };

  const rolesTemplate = (rowData: User) => {
    // Check if roles is an array
    if (Array.isArray(rowData.role)) {
      // Alphabetize the array of roles and then convert it to a comma-separated string
      return rowData.role.sort().join(", ");
    } else if (typeof rowData.role === "string") {
      // If role is a string, ensure it's formatted with spaces after commas
      return rowData.role
        .split(",")
        .map((s) => s.trim())
        .join(", ");
    }
    // If roles is a string, just return it as is
    return rowData.role;
  };

  const [editingRows, setEditingRows] = useState<{ [key: number]: boolean }>({});
  const [isFormValid, setIsFormValid] = useState<{ [key: number]: boolean }>({});

  const validateRow = (data: User): boolean => {
    return !!(
      data.first_name &&
      data.last_name &&
      data.email &&
      data.role &&
      (Array.isArray(data.role) ? data.role.length > 0 : data.role !== "") &&
      data.view
    );
  };

  const updateFormValidity = (rowData: User) => {
    if (rowData.id !== undefined) {
      setIsFormValid((prev) => ({
        ...prev,
        [rowData.id as number]: validateRow(rowData),
      }));
    }
  };

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    let { newData } = e as { newData: User };

    // Transform the schools array back into a string
    if (Array.isArray(newData.school)) {
      newData = {
        ...newData,
        school: newData.school.join(", "),
      };
    }

    // Handle saving the edited data
    let updatedUsers = users;

    if (newData.id === undefined || e.data.id < 0) {
      // Handling new row
      updatedUsers = users.map((user) =>
        user.id === -1 ? ({ ...e.data, id: 0 } as User) : user
      );

      const dataForSave = {
        ...newData,
        school: formatSchoolsForSave(newData.school),
        first_name: newData.first_name ?? "",
        last_name: newData.last_name ?? "",
        email: newData.email ?? "",
        phone: newData.phone ?? "",
        role: formatRolesForSave(newData.role),
        view: newData.view ?? "",
        super_admin_role: newData.super_admin_role ?? null,
        picture: newData.picture ?? null,
        created_at: new Date(),
      };
      createUserMutation.mutate(dataForSave, {
        onSuccess: (response) => {
          if (response.id) {
            setUsers((prevUsers) => {
              const updatedUsers = prevUsers.map((user) => {
                if (user.id === dataForSave.id) {
                  // Replace the temporary ID with the actual ID
                  return { ...dataForSave, id: response.id };
                } else {
                  return user;
                }
              });
              // Add the new user to the list
              const userData = createUserMutation.data as User;
              if (userData) {
                updatedUsers.push(userData);
              }
              return updatedUsers;
            });
          } else {
            console.log("no id returned from the server");
          }

          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "User saved",
          });
        },
        onError: (error) => {
          console.log("error", error);
          // On error, show an error toast
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Save failed",
          });
        },
      });
    } else {
      // Handling existing row update
      updatedUsers = users.map((user) =>
        user.id === e.data.id ? ({ ...e.data } as User) : user
      );

      const dataForSave = {
        ...newData,
        school: formatSchoolsForSave(newData.school),
        first_name: newData.first_name ?? "",
        last_name: newData.last_name ?? "",
        email: newData.email ?? "",
        phone: newData.phone ?? "",
        role: formatRolesForSave(newData.role),
        view: newData.view ?? "",
        super_admin_role: newData.super_admin_role ?? null,
        picture: newData.picture ?? null,
        created_at: new Date(),
      };

      // Call the mutation to update the user
      updateUserMutation.mutate(dataForSave, {
        onSuccess: (response) => {
          if (response) {
            // On success, maybe refresh the data or show a success toast
            setUsers((prevUsers) => {
              const index = prevUsers.findIndex(
                (user) => user.id === dataForSave.id
              );

              if (index !== -1) {
                // User exists, update their information
                const newUsers = [...prevUsers];
                newUsers[index] = dataForSave;
                return newUsers;
              } else {
                // New user, add them to the list
                return [dataForSave, ...prevUsers];
              }
            });
            toast.current?.show({
              severity: "success",
              summary: "Success",
              detail: "User updated",
            });
          }
        },
        onError: (error) => {
          console.log("error", error);
          // On error, show an error toast
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Update failed",
          });
        },
      });
    }
    if (newData.id !== undefined) {
      setEditingRows((prev) => ({ ...prev, [newData.id as number]: false }));
      setIsFormValid((prev) => ({ ...prev, [newData.id as number]: true }));
    }
  };

  const deleteUserMutation = api.users.deleteUser.useMutation();

  const handleDeleteUser = (userId?: number) => {
    const id = userId || 0;

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
                deleteUserMutation.mutate(
                  { id: id },
                  {
                    onSuccess: (response) => {
                      if (response) {
                        toastDelete.current?.clear();
                        setUsers((users) =>
                          users.filter((user) => user.id !== id)
                        );

                        // Optionally, show a success message
                        toast.current?.show({
                          severity: "success",
                          summary: "Success",
                          detail: "User added successfully",
                        });
                      }
                    },
                    onError: (error) => {
                      console.log("error", error);
                      toastDelete.current?.clear();
                      if (deleteUserMutation.isError) {
                        console.error("Error deleting user.");
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

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };

    if (_filters.global && "value" in _filters.global) {
      _filters.global.value = value || "";
    }
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div className="flex align-items-center">
          {session?.user.role !== "Tutor" && (
            <Button onClick={handleOpen} variant="contained">
              Add
            </Button>
          )}
        </div>
        <div className="flex justify-content-end">
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

  const newRowClass = (data: User) => {
    return {
      "bg-red-50": data.first_name === "",
    };
  };

  const editRowIcons = (rowData: User, options: ColumnBodyOptions) => (
    <>
      {options.rowEditor?.editing ? (
        <div className="flex gap-1 justify-content-center">
          <CheckIcon
            onClick={(e) =>
              rowData.id !== undefined &&
              isFormValid[rowData.id] &&
              options.rowEditor?.onSaveClick &&
              options.rowEditor?.onSaveClick(e)
            }
            color={rowData.id !== undefined && isFormValid[rowData.id] ? "primary" : "disabled"}
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
            onClick={() => {
              if (rowData.id && rowData.id < 0) {
                setUsers((prevUsers) =>
                  prevUsers.filter((user) => user.id !== rowData.id)
                );
              } else if (rowData.id && rowData.id > 0) {
                const userId = rowData.id;
                handleDeleteUser(userId);
              }
            }}
          />
        </div>
      )}
    </>
  );

  const firstNameEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="First Name"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
          updateFormValidity({ ...options.rowData, first_name: e.target.value } as User);
        }}
        className={value ? "" : "p-invalid"}
      />
    );
  };

  const lastNameEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Last Name"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
          updateFormValidity({ ...options.rowData, last_name: e.target.value } as User);
        }}
        className={value ? "" : "p-invalid"}
      />
    );
  };

  const emailEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Email"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
          updateFormValidity({ ...options.rowData, email: e.target.value } as User);
        }}
        className={value ? "" : "p-invalid"}
      />
    );
  };

  const phoneEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <InputText
        type="text"
        value={value}
        placeholder="Phone"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          options.editorCallback?.(e.target.value);
        }}
      />
    );
  };

  const schoolEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string | string[] | null | undefined;

    const currentValue = processSchool(value);

    const handleSchoolChange = (e: MultiSelectChangeEvent) => {
      // Explicitly cast e.value to string[]
      let selectedSchools: string[] = e.value as string[];

      if (selectedSchools.includes("None") && selectedSchools.length > 1) {
        selectedSchools = ["None"];
      } else if (!selectedSchools.includes("None")) {
        selectedSchools = selectedSchools.filter((school) => school !== "None");
      }

      options.editorCallback?.(selectedSchools);
    };

    return (
      <MultiSelect
        value={currentValue}
        options={appSettings.school_options.map((school) => ({
          label: school,
          value: school,
        }))}
        onChange={handleSchoolChange}
        placeholder="Schools"
        optionLabel="label"
        className="text-black"
        filter
        resetFilterOnHide
        selectAllLabel="All"
      />
    );
  };

  const formatSchoolsForSave = (
    school: string | string[] | null | undefined
  ): string => {
    // If school is a string, split it into an array
    // If school is null or undefined, use an empty array
    const schoolArray =
      typeof school === "string"
        ? school.split(", ").map((s) => s.trim())
        : school || [];
    return Array.from(new Set(schoolArray)).join(", ");
  };

  useEffect(() => {
    if (myUsers) {
      const processedUsers = myUsers.map((user) => ({
        ...user,
        school: processSchool(user.school).toString(),
        // Other fields...
      }));

      // Sort the processed users by last name
      const sortedUsers = processedUsers.sort((a, b) => {
        return (a.last_name || '').localeCompare(b.last_name || '');
      });

      setUsers(sortedUsers);

      // Initialize isFormValid state for all users
      const initialFormValidity = sortedUsers.reduce((acc, user) => {
        if (user.id !== undefined) {
          acc[user.id] = validateRow(user);
        }
        return acc;
      }, {} as { [key: number]: boolean });

      setIsFormValid(initialFormValidity);
    }
  }, [myUsers]);

  const onRowEditInit = (event: DataTableRowEditEvent) => {
    const { data } = event;
    if (data.id !== undefined) {
      setEditingRows((prev) => ({ ...prev, [data.id as number]: true }));
      setIsFormValid((prev) => ({ ...prev, [data.id as number]: validateRow(data) }));
    }
  };

  const onRowEditCancel = (event: DataTableRowEditEvent) => {
    const { data } = event;
    if (data.id !== undefined) {
      setEditingRows((prev) => ({ ...prev, [data.id as number]: false }));
      setIsFormValid((prev) => ({ ...prev, [data.id as number]: validateRow(data) }));
    }
  };

  const roleEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string | string[] | undefined;
  
    const currentValue = processRole(value) as string[] | undefined;
  
    const handleRoleChange = (e: MultiSelectChangeEvent) => {
      // Explicitly cast e.value to string[]
      let selectedRoles: string[] = e.value as string[];
  
      if (selectedRoles.includes("None") && selectedRoles.length > 1) {
        selectedRoles = ["None"];
      } else if (!selectedRoles.includes("None")) {
        selectedRoles = selectedRoles.filter((role) => role !== "None");
      }
  
      options.editorCallback?.(selectedRoles);
      
      // Update form validity immediately after changing the roles
      if (options.rowData && typeof options.rowData === 'object') {
        const rowData = options.rowData as Partial<User>;
        if (typeof rowData.id === 'number') {
          const updatedRowData = { ...rowData, role: selectedRoles.join(', ') };
          setIsFormValid((prev) => ({
            ...prev,
            [rowData.id as number]: validateRow(updatedRowData as User),
          }));
        }
      }
    };

    return (
      <MultiSelect
        value={currentValue}
        options={appSettings.user_role_options.map((role) => ({
          label: role,
          value: role,
        }))}
        onChange={handleRoleChange}
        placeholder="Roles"
        optionLabel="label"
        selectAllLabel="All"
        className={`text-black ${value && (Array.isArray(value) ? value.length > 0 : value !== "") ? "" : "p-invalid"}`}
      />
    );
  };

  const formatRolesForSave = (
    role: string | string[] | null | undefined
  ): string => {
    // If role is a string, split it into an array
    // If role is null or undefined, use an empty array
    const roleArray =
      typeof role === "string"
        ? role.split(", ").map((s) => s.trim())
        : role || [];
    return Array.from(new Set(roleArray)).join(", ");
  };

  const viewEditor = (options: ColumnEditorOptions) => {
    const value = options.value as string;
    return (
      <Dropdown
        value={value}
        options={appSettings.initial_view_options}
        onChange={(e: DropdownChangeEvent) => {
          options.editorCallback?.(e.value);
        }}
        placeholder="View"
        itemTemplate={(option) => <span>{option}</span>}
        className={value ? "" : "p-invalid"}
      />
    );
  };

  const updateUserMutation = api.users.updateUser.useMutation();
  const createUserMutation = api.users.createUser.useMutation();

  return (
    <>
      <AddUserForm
        session={session}
        users={users}
        setUsers={setUsers}
        open={open}
        setOpen={setOpen}
        runSuccessToast={runSuccessToast}
        setRunSuccessToast={setRunSuccessToast}
      />

      <Card className="card">
        <Toast ref={toast} />
        <Toast ref={toastDelete} position="top-center" />
        <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
          <h3>Users</h3>
        </div>
        <DataTable
          value={users}
          editMode="row"
          editingRows={editingRows}
          onRowEditComplete={onRowEditComplete}
          dataKey="id"
          key="id"
          stripedRows
          removableSort
          rowClassName={newRowClass}
          tableStyle={{ minWidth: "60rem" }}
          filters={filters}
          globalFilterFields={[
            "first_name",
            "last_name",
            "school",
            "email",
            "phone",
            "role",
            "view",
          ]}
          header={header}
          emptyMessage="No users match your search."
          showGridlines
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onRowEditInit={onRowEditInit}
          onRowEditCancel={onRowEditCancel}
        >
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
            header="Schools"
            body={schoolsTemplate}
            editor={(options) => schoolEditor(options)}
            sortable
          />
          <Column
            field="email"
            header="Email"
            editor={(options) => emailEditor(options)}
            sortable
          />
          <Column
            field="phone"
            header="Phone"
            editor={(options) => phoneEditor(options)}
            sortable
          />
          <Column
            field="role"
            header="Role"
            body={rolesTemplate}
            editor={(options) => roleEditor(options)}
            sortable
          />
          <Column
            field="view"
            header="View"
            editor={(options) => viewEditor(options)}
            sortable
          />
          <Column
            header="Actions"
            rowEditor
            body={editRowIcons}
            headerStyle={{ width: "1%", minWidth: "2rem" }}
            bodyStyle={{ textAlign: "center" }}
          ></Column>
        </DataTable>
      </Card>
    </>
  );
};

export default Users;
