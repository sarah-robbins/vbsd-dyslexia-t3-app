// import React, { useState, useEffect, useRef } from 'react';
// import {
//   DataTable,
//   type DataTableFilterMeta,
//   type DataTableRowEditCompleteEvent,
// } from 'primereact/datatable';
// import { Column, type ColumnEditorOptions } from 'primereact/column';
// import { api } from '@/utils/api';
// import { Card } from 'primereact/card';
// import type { User, AppSettings } from '@/types';
// import { FilterMatchMode } from 'primereact/api';
// import { InputText } from 'primereact/inputtext';
// import { type Toast } from 'primereact/toast';
// import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
// import { useSession } from 'next-auth/react';
// import {
//   type MultiSelectChangeEvent,
//   MultiSelect,
// } from 'primereact/multiselect';
// import { IconButton } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import dayjs from 'dayjs';

// const Users: React.FC = () => {
//   const getAllUsers = api.users.getAllUsers.useQuery();
//   const [users, setUsers] = useState<User[]>([]);

//   useEffect(() => {
//     setUsers(getAllUsers.data as User[]);
//   }, [getAllUsers]);

//   // use the session to get appSettings
//   const { data: session } = useSession();
//   const currentUserData = session?.user;
//   const appSettings = session?.appSettings as AppSettings;

//   console.log('currentUserData', currentUserData);
//   console.log('appSettings', appSettings);

//   const [filters, setFilters] = useState<DataTableFilterMeta>({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     first_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     last_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     school: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     email: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     phnoe: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     role: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     vew: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });
//   const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

//   const updateUserMutation = api.users.updateUser.useMutation();
//   const createUserMutation = api.users.createUser.useMutation();
//   const toast = useRef<Toast>(null);
//   const [editingRows, setEditingRows] = useState({});

//   const textEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <InputText
//         type="text"
//         value={value}
//         onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//           options.editorCallback?.(e.target.value)
//         }
//       />
//     );
//   };

//   // const schoolEditor = (options: ColumnEditorOptions) => {
//   //   const value = options.value as string;
//   //   return (
//   //     // this will need to be a MultiSelect to allow for multiple schools.
//   //     <Dropdown
//   //       value={value}
//   //       options={appSettings.school_options}
//   //       onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//   //       placeholder="School"
//   //       itemTemplate={(option) => {
//   //         return <span>{option}</span>;
//   //       }}
//   //     />
//   //   );
//   // };

//   const schoolEditor = (options: ColumnEditorOptions) => {
//     const currentValue = Array.isArray(options.value)
//       ? options.value
//       : options.value
//       ? [options.value]
//       : [];

//     const handleSchoolChange = (e: MultiSelectChangeEvent) => {
//       // Explicitly cast e.value to string[]
//       let selectedSchools: string[] = e.value as string[];

//       if (selectedSchools.includes('None') && selectedSchools.length > 1) {
//         selectedSchools = ['None'];
//       } else if (!selectedSchools.includes('None')) {
//         selectedSchools = selectedSchools.filter((school) => school !== 'None');
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

//   const roleEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <Dropdown
//         value={value}
//         options={appSettings.user_role_options}
//         onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//         placeholder="Role"
//         itemTemplate={(option) => {
//           return <span>{option}</span>;
//         }}
//       />
//     );
//   };

//   const viewEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <Dropdown
//         value={value}
//         options={appSettings.initial_view_options}
//         onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//         placeholder="View"
//         itemTemplate={(option) => {
//           return <span>{option}</span>;
//         }}
//       />
//     );
//   };

//   const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
//     // Handle saving the edited data
//     if (e.data.id === undefined) {
//       createUserMutation.mutate(e, {
//         onSuccess: () => {
//           // On success, maybe refresh the data or show a success toast
//           toast.current?.show({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'User saved',
//           });
//         },
//         onError: (error) => {
//           console.log('error', error);
//           // On error, show an error toast
//           toast.current?.show({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Save failed',
//           });
//         },
//       });
//     } else {
//       // Handling existing row update
//       // Call the mutation to update the user
//       updateUserMutation.mutate(e, {
//         onSuccess: () => {
//           // On success, maybe refresh the data or show a success toast
//           toast.current?.show({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'User updated',
//           });
//         },
//         onError: (error) => {
//           console.log('error', error);
//           // On error, show an error toast
//           toast.current?.show({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Update failed',
//           });
//         },
//       });
//     }
//   };

//   const addNewUser = () => {
//     const newUser: User = {
//       // id: null, // Temporary ID for the new row
//       first_name: 'First Name',
//       last_name: 'Last Name',
//       school: 'School',
//       email: 'Email',
//       phone: 'Phone Number',
//       role: 'Role',
//       view: 'View',
//       super_admin_role: '',
//       picture: '',
//       created_at: dayjs().toDate(),
//     };
//     console.log('***newUser', newUser);
//     setUsers((prev) => [...prev, newUser]);
//     console.log('***users', users);
//     setEditingRows({ '-1': true });
//   };
//   // const rows = [...users].filter((r) => r != null);

//   useEffect(() => {
//     console.log('Updated users:', users);
//   }, [users]);

//   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     const _filters = { ...filters };
//     if (_filters.global && 'value' in _filters.global) {
//       _filters.global.value = value || '';
//     }
//     setFilters(_filters);
//     setGlobalFilterValue(value);
//   };

//   const renderHeader = () => {
//     return (
//       <div className="flex justify-content-between">
//         <div className="flex align-items-center">
//           <IconButton
//             color="secondary"
//             aria-label="add a new user"
//             onClick={addNewUser}>
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

//   // style the row based on conditions
//   const newRowClass = (data: User) => {
//     return {
//       'bg-primary': data.first_name === 'test',
//     };
//   };

//   if (!getAllUsers.data) return <p>Loading...</p>;

//   return (
//     <Card className="card">
//       <DataTable
//         value={users}
//         dataKey="id"
//         stripedRows
//         removableSort
//         editMode="row"
//         editingRows={editingRows}
//         onRowEditComplete={onRowEditComplete}
//         rowClassName={newRowClass}
//         tableStyle={{ minWidth: '60rem' }}
//         filters={filters}
//         filterDisplay="row"
//         globalFilterFields={[
//           'first_name',
//           'last_name',
//           'school',
//           'email',
//           'phone',
//           'role',
//           'view',
//         ]}
//         header={header}
//         emptyMessage="No users match your search.">
//         {/* <Column
//           body={userNameTemplate}
//           header="Name"
//           style={{ whiteSpace: 'nowrap' }}
//           sortable
//         /> */}
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
//           field="school"
//           header="School"
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
//           editor={(options) => roleEditor(options)}
//           sortable
//         />
//         <Column
//           field="view"
//           header="View"
//           editor={(options) => viewEditor(options)}
//           sortable
//         />
//         <Column
//           rowEditor
//           headerStyle={{ width: '10%', minWidth: '8rem' }}
//           bodyStyle={{ textAlign: 'center' }}></Column>
//       </DataTable>
//     </Card>
//   );
// };

// export default Users;
