// import React, { useState, useEffect, useRef } from "react";
// import {
//   DataTable,
//   type DataTableRowEditCompleteEvent,
//   type DataTableFilterMeta,
//   type DataTableRowEvent,
// } from "primereact/datatable";
// import { FilterMatchMode } from "primereact/api";
// import { Column, type ColumnEditorOptions } from "primereact/column";
// import { api } from "@/utils/api";
// import { Toast } from "primereact/toast";
// import { Card } from "primereact/card";

// import type { User, customSession } from "@/types";
// import { InputText } from "primereact/inputtext";
// import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
// import {
//   MultiSelect,
//   type MultiSelectChangeEvent,
// } from "primereact/multiselect";
// import AddIcon from "@mui/icons-material/Add";
// import { FormControlLabel, IconButton, Switch, TextField } from "@mui/material";
// import { Button } from "primereact/button";
// import { useSession } from "next-auth/react";

// const Users: React.FC = () => {
//   const getAllUsers = api.users.getAllUsers.useQuery();
//   const [users, setUsers] = useState<User[]>([]);
//   const toast = useRef<Toast>(null);
//   // use the session to get appSettings
//   const { data: session } = useSession();
//   // const currentUserData = session?.user;
//   const appSettings = (session as customSession)?.appSettings;
//   const [filters, setFilters] = useState<DataTableFilterMeta>({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     first_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     last_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     school: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     email: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     role: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     view: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });
//   const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

//   useEffect(() => {
//     if (getAllUsers.data) {
//       setUsers(getAllUsers.data);
//       console.log("getAllUsers.data", getAllUsers.data);
//     }
//   }, [getAllUsers.data]);

//   // const { data: myUsers } = api.users.getUsersBySchool.useQuery("King") as {
//   //   data: User[];
//   // };

//   const [editingRows, setEditingRows] = useState({});
//   const addNewUser = () => {
//     const newUser: User = {
//       // id: null, // Temporary ID for the new row
//       first_name: "First Name",
//       last_name: "Last Name",
//       school: "School",
//       email: "Email",
//       phone: "Phone",
//       role: "Role",
//       view: "View",
//       super_admin_role: null,
//       picture: null,
//       created_at: new Date(),
//     };
//     setUsers((prev) => [...prev, newUser]);
//     setEditingRows({ "-1": true });
//   };

//   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     const _filters = { ...filters };

//     if (_filters.global && "value" in _filters.global) {
//       _filters.global.value = value || "";
//     }
//     setFilters(_filters);
//     setGlobalFilterValue(value);
//   };

//   // const schools = ['King', 'Northridge', 'Oliver Springs'];

//   const textEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <InputText
//         type="text"
//         value={value}
//         placeholder="Enter a value"
//         onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//           options.editorCallback?.(e.target.value)
//         }
//       />
//     );
//   };

//   const schoolEditor = (options: ColumnEditorOptions) => {
//     const currentValue = Array.isArray(options.value)
//       ? options.value
//       : options.value
//       ? [options.value]
//       : [];

//     const handleSchoolChange = (e: MultiSelectChangeEvent) => {
//       // Explicitly cast e.value to string[]
//       let selectedSchools: string[] = e.value as string[];

//       if (selectedSchools.includes("None") && selectedSchools.length > 1) {
//         selectedSchools = ["None"];
//       } else if (!selectedSchools.includes("None")) {
//         selectedSchools = selectedSchools.filter((school) => school !== "None");
//       }

//       options.editorCallback?.(selectedSchools);
//     };

//     return (
//       <MultiSelect
//         value={currentValue}
//         options={appSettings.school_options.map((school) => ({
//           label: school,
//           value: school,
//         }))}
//         onChange={handleSchoolChange}
//         placeholder="Schools"
//         optionLabel="label"
//       />
//     );
//   };
//   const schoolsTemplate = (rowData: User) => {
//     // Check if schools is an array
//     if (Array.isArray(rowData.school)) {
//       // Alphabetize the array of schools and then convert it to a comma-separated string
//       return rowData.school.sort().join(", ");
//     } else {
//       // If schools is a string, just return it as is
//       return rowData.school;
//     }
//   };

//   const updateUserMutation = api.users.updateUser.useMutation();
//   const createUserMutation = api.users.createUser.useMutation();

//   const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
//     console.log("🚀 ~ onRowEditComplete ~ e:", e);
//     let { newData } = e as { newData: User };

//     // Transform the schools array back into a string
//     if (Array.isArray(newData.school)) {
//       newData = {
//         ...newData,
//         school: newData.school.join(", "),
//       };
//     }

//     // Handle saving the edited data
//     let updatedUsers = users;
//     if (e.data.id === undefined) {
//       // Handling new row
//       updatedUsers = users.map((user) =>
//         user.id === -1 ? { ...e.data, id: 0 } : user
//       );

//       const dataForSave = {
//         ...newData,
//         school: newData.school ?? "",
//         first_name: newData.first_name ?? "",
//         last_name: newData.last_name ?? "",
//         email: newData.email ?? "",
//         phone: newData.phone ?? "",
//         role: newData.role ?? "",
//         view: newData.view ?? "",
//         super_admin_role: newData.super_admin_role ?? null,
//         picture: newData.picture ?? null,
//         last_edited: new Date(),
//         created_at: new Date(),
//       };
//       createUserMutation.mutate(dataForSave, {
//         onSuccess: () => {
//           // On success, maybe refresh the data or show a success toast
//           toast.current?.show({
//             severity: "success",
//             summary: "Success",
//             detail: "User saved",
//           });
//         },
//         onError: (error) => {
//           console.log("error", error);
//           // On error, show an error toast
//           toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Save failed",
//           });
//         },
//       });
//     } else {
//       // Handling existing row update
//       updatedUsers = users.map((user) =>
//         user.id === e.data.id ? { ...e.data } : user
//       );

//       const dataForSave = {
//         ...newData,
//         school: newData.school ?? "",
//         first_name: newData.first_name ?? "",
//         last_name: newData.last_name ?? "",
//         email: newData.email ?? "",
//         phone: newData.phone ?? "",
//         role: newData.role ?? "",
//         view: newData.view ?? "",
//         super_admin_role: newData.super_admin_role ?? null,
//         picture: newData.picture ?? null,
//         last_edited: new Date(),
//         created_at: new Date(),
//       };

//       // Call the mutation to update the user
//       updateUserMutation.mutate(dataForSave, {
//         onSuccess: () => {
//           // On success, maybe refresh the data or show a success toast
//           toast.current?.show({
//             severity: "success",
//             summary: "Success",
//             detail: "User updated",
//           });
//         },
//         onError: (error) => {
//           console.log("error", error);
//           // On error, show an error toast
//           toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Update failed",
//           });
//         },
//       });
//     }
//   };

//   const deleteUserMutation = api.users.deleteUser.useMutation();

//   const handleDeleteUser = (userId?: number) => {
//     const id = userId || 0;
//     // Call the TRPC mutation to delete the user
//     deleteUserMutation.mutate(
//       { id },
//       {
//         onSuccess: () => {
//           // On success, filter out the deleted user from the local state
//           setUsers((users) => users.filter((user) => user.id !== userId));

//           // Optionally, show a success message
//           toast.current?.show({
//             severity: "success",
//             summary: "Success",
//             detail: "User deleted",
//           });
//         },
//         onError: (error) => {
//           // On error, show an error message
//           console.error("Error deleting user:", error);
//           toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Delete failed",
//           });
//         },
//       }
//     );
//   };

//   const actionBodyTemplate = (rowData: User) => {
//     if (typeof rowData.id !== "number") {
//       return null;
//     }
//     return <Button onClick={() => handleDeleteUser(rowData.id)}>Delete</Button>;
//   };

//   const renderHeader = () => {
//     return (
//       <div className="flex justify-content-between">
//         <div className="flex align-items-center">
//           <IconButton
//             color="secondary"
//             aria-label="add a new user"
//             onClick={addNewUser}
//           >
//             <AddIcon color="primary" fontSize="large" />
//           </IconButton>
//         </div>
//         <div className="flex justify-content-end">
//           <span className="p-input-icon-left">
//             <i className="pi pi-search" />
//             <InputText
//               value={globalFilterValue}
//               onChange={onGlobalFilterChange}
//               placeholder="Search"
//             />
//           </span>
//         </div>
//       </div>
//     );
//   };
//   const header = renderHeader();

//   // const rows = [editingRow, ...users].filter((r) => r != null);

//   // load animation for the table
//   if (!getAllUsers.data) return <p>Loading...</p>;

//   // choose waht to do when a row in clicked
//   const rowSelected = (e: DataTableRowEvent) => {
//     console.log("e", e);
//   };

//   // style the row based on conditions
//   const newRowClass = (data: User) => {
//     return {
//       "bg-primary":
//         data.super_admin_role === true && data.id !== undefined && data.id > -2,
//       "bg-red-100": data.first_name === "First Name",
//       "text-white":
//         data.super_admin_role === true && data.id !== undefined && data.id > -2,
//     };
//   };

//   return (
//     <Card className="card">
//       <Toast ref={toast} />
//       <DataTable
//         value={users}
//         editMode="row"
//         // onRowEditInit={(e) => setEditingRows(e.data.id)}
//         editingRows={editingRows}
//         onRowEditComplete={onRowEditComplete}
//         dataKey="id"
//         stripedRows
//         removableSort
//         rowClassName={newRowClass}
//         onRowSelect={rowSelected}
//         tableStyle={{ minWidth: "60rem" }}
//         filters={filters}
//         filterDisplay="row"
//         globalFilterFields={[
//           "first_name",
//           "last_name",
//           "school",
//           "email",
//           "phone",
//           "role",
//           "view",
//         ]}
//         header={header}
//         emptyMessage="No users match your search."
//       >
//         <Column
//           field="first_name"
//           header="First Name"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           field="last_name"
//           header="Last Name"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           field="schools"
//           header="Schools"
//           body={schoolsTemplate}
//           editor={(options) => schoolEditor(options)}
//           sortable
//         />
//         <Column
//           field="email"
//           header="Email"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           field="phone"
//           header="Phone"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           field="role"
//           header="Role"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           field="view"
//           header="View"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           rowEditor
//           headerStyle={{ width: "10%", minWidth: "8rem" }}
//           bodyStyle={{ textAlign: "center" }}
//         ></Column>
//         <Column
//           headerStyle={{ width: "5rem", textAlign: "center" }}
//           bodyStyle={{ textAlign: "center", overflow: "visible" }}
//           body={actionBodyTemplate}
//         />
//       </DataTable>
//     </Card>
//   );
// };

// export default Users;
