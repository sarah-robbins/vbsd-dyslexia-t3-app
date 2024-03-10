// import React, { useState, useEffect, useRef } from 'react';
// import {
//   DataTable,
//   type DataTableRowEditCompleteEvent,
//   type DataTableFilterMeta,
//   type DataTableExpandedRows,
//   type DataTableValueArray,
//   type DataTableRowEvent,
// } from 'primereact/datatable';
// import { FilterMatchMode } from 'primereact/api';
// import { Column, type ColumnEditorOptions } from 'primereact/column';
// import { api } from '@/utils/api';
// import { Toast } from 'primereact/toast';
// import { Card } from 'primereact/card';

// import type { User, Student, FormValues } from '@/types';
// import { InputText } from 'primereact/inputtext';
// import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
// import {
//   MultiSelect,
//   type MultiSelectChangeEvent,
// } from 'primereact/multiselect';
// import AddIcon from '@mui/icons-material/Add';
// import { FormControlLabel, IconButton, Switch, TextField } from '@mui/material';
// import { Button } from 'primereact/button';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs, { Dayjs } from 'dayjs';
// // import { useSession } from 'next-auth/react';

// interface TutorOption {
//   label: string;
//   value: number | undefined;
// }

// const Students: React.FC = () => {
//   const getAllStudents = api.students.getAllStudents.useQuery();
//   const [students, setStudents] = useState<Student[]>([]);
//   const [expandedRows, setExpandedRows] = useState<
//     DataTableExpandedRows | DataTableValueArray | undefined
//   >(undefined);
//   const toast = useRef<Toast>(null);

//   const [filters, setFilters] = useState<DataTableFilterMeta>({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     first_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     last_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     student_assigned_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     school: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     grade: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     home_room_teacher: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     intervention_program: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     tutorFullName: { value: null, matchMode: FilterMatchMode.CONTAINS },
//     date_intervention_began: {
//       value: null,
//       matchMode: FilterMatchMode.CONTAINS,
//     },
//     calculateTotalMeetings: {
//       value: null,
//       matchMode: FilterMatchMode.CONTAINS,
//     },
//     services: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });
//   const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

//   const { data: myStudents } = api.students.getStudentsForRole.useQuery() as {
//     data: Student[];
//   };
//   console.log('myStudents', myStudents);

//   const { data: myUsers } = api.users.getUsersBySchool.useQuery('King') as {
//     data: User[];
//   };
//   console.log('myUsers', myUsers);
//   const [formattedTutors, setFormattedTutors] = useState<TutorOption[]>([]);

//   const processServices = (
//     services: string | string[] | null | undefined
//   ): string[] => {
//     if (Array.isArray(services)) {
//       // If services is already an array, return it as is
//       return services;
//     } else if (typeof services === 'string') {
//       // If services is a string, split it into an array
//       return services.split(', ');
//     } else {
//       // If services is null or undefined, return an empty array
//       return [];
//     }
//   };

//   const servicesTemplate = (rowData: Student) => {
//     // Check if services is an array
//     if (Array.isArray(rowData.services)) {
//       // Alphabetize the array of services and then convert it to a comma-separated string
//       return rowData.services.sort().join(', ');
//     } else {
//       // If services is a string, just return it as is
//       return rowData.services;
//     }
//   };

//   // Manipulate Student data for display
//   useEffect(() => {
//     if (myStudents) {
//       console.log('myStudents', myStudents);
//       const processedStudents = myStudents.map((student) => ({
//         ...student,
//         services: processServices(student.services),
//         tutorId: student.tutor_id,
//         studentFullName: `${student.last_name as string}, ${
//           student.first_name as string
//         }`,
//         tutorFullName: `${student.Users?.first_name as string} ${
//           student.Users?.last_name as string
//         }`,
//         calculateTotalMeetings:
//           student.MeetingAttendees?.filter(
//             (attendee) => attendee.meeting_status === 'Met'
//           ).length ?? 0,
//       }));
//       console.log('processedStudents', processedStudents);
//       setStudents(processedStudents);
//     }
//   }, [myStudents]);

//   // Fetch all tutors (separate API call)
//   useEffect(() => {
//     if (myUsers) {
//       const formattedData = myUsers.map((user) => ({
//         label: `${user.first_name} ${user.last_name}`,
//         value: user.id, // Ensure this is the unique identifier
//       }));
//       setFormattedTutors(formattedData);
//       console.log('formattedTutors', formattedTutors);
//     }
//   }, [myUsers]);

//   const [editingRow, setEditingRow] = useState<number | null>(null);
//   const addNewStudent = () => {
//     const newStudent = {
//       id: -1, // Temporary ID for the new row
//       first_name: '',
//       last_name: '',
//       student_assigned_id: '',
//       school: '',
//       grade: '',
//       home_room_teacher: '',
//       intervention_program: '',
//       tutorId: null,
//       date_intervention_began: dayjs(),
//       services: [],

//       // ... other fields set to default/empty values ...
//     };

//     console.log('newStudent', newStudent);

//     setStudents([newStudent, ...students]);
//     setEditingRow(-1);
//   };
//   // const rows = [...students].filter((r) => r != null);

//   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     const _filters = { ...filters };
//     console.log('_filters', _filters);
//     console.log('value from filter', value);

//     if (_filters.global && 'value' in _filters.global) {
//       _filters.global.value = value || '';
//     }
//     setFilters(_filters);
//     setGlobalFilterValue(value);
//   };

//   const schools = ['King', 'Northridge', 'Oliver Springs'];

//   const grades = [
//     'K',
//     '1',
//     '2',
//     '3',
//     '4',
//     '5',
//     '6',
//     '7',
//     '8',
//     '9',
//     '10',
//     '11',
//     '12',
//   ];

//   const programs = ['Barton', 'Connections', 'Foundations'];
//   const services = ['504', 'IEP', 'None', 'Other'];

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

//   const schoolEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <Dropdown
//         value={value}
//         options={schools}
//         onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//         placeholder="School"
//         itemTemplate={(option) => {
//           return <span>{option}</span>;
//         }}
//       />
//     );
//   };

//   const gradeEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <Dropdown
//         value={value}
//         options={grades}
//         onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//         placeholder="Grade"
//         itemTemplate={(option) => {
//           return <span>{option}</span>;
//         }}
//       />
//     );
//   };

//   const programEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as string;
//     return (
//       <Dropdown
//         value={value}
//         options={programs}
//         onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//         placeholder="Program"
//         itemTemplate={(option) => {
//           return <span>{option}</span>;
//         }}
//       />
//     );
//   };

//   const serviceEditor = (options: ColumnEditorOptions) => {
//     const currentValue = Array.isArray(options.value)
//       ? options.value
//       : options.value
//       ? [options.value]
//       : [];

//     const handleServiceChange = (e: MultiSelectChangeEvent) => {
//       // Explicitly cast e.value to string[]
//       let selectedServices: string[] = e.value as string[];

//       if (selectedServices.includes('None') && selectedServices.length > 1) {
//         selectedServices = ['None'];
//       } else if (!selectedServices.includes('None')) {
//         selectedServices = selectedServices.filter(
//           (service) => service !== 'None'
//         );
//       }

//       options.editorCallback?.(selectedServices);
//     };

//     return (
//       <MultiSelect
//         value={currentValue}
//         options={services.map((service) => ({
//           label: service,
//           value: service,
//         }))}
//         onChange={handleServiceChange}
//         placeholder="Services"
//         optionLabel="label"
//       />
//     );
//   };

//   const tutorEditor = (options: ColumnEditorOptions) => {
//     const value = options.value as number;
//     const tutor = formattedTutors.find((tutor) => tutor.value === value);
//     console.log('options', options);
//     console.log('tutor', tutor);
//     console.log('value', value);

//     return (
//       <Dropdown
//         value={value}
//         options={formattedTutors}
//         onChange={(e: DropdownChangeEvent) => options.editorCallback?.(e.value)}
//         placeholder="Tutor Name"
//       />
//     );
//   };

//   // Format Tutor names
//   useEffect(() => {
//     if (myUsers) {
//       const formattedData = myUsers.map((user) => ({
//         label: `${user.first_name} ${user.last_name}`,
//         value: user.id, // Ensure this is the unique identifier
//       }));
//       setFormattedTutors(formattedData);
//     }
//   }, [myUsers]);

//   const updateStudentMutation = api.students.updateStudent.useMutation();

//   const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
//     let { newData } = e;

//     // Transform the services array back into a string
//     if (Array.isArray(newData.services)) {
//       newData = {
//         ...newData,
//         services: newData.services.join(', '),
//       };
//     }

//     // Update tutorFullName based on tutorId
//     const updatedTutor = formattedTutors.find(
//       (tutor) => tutor.value === newData.tutorId
//     );
//     console.log('updatedTutor', updatedTutor);
//     newData.tutorFullName = updatedTutor ? updatedTutor.label : '';

//     // Handle saving the edited data
//     let updatedStudents = students;
//     if (e.data.id === -1) {
//       // Handling new row
//       updatedStudents = students.map((student) =>
//         student.id === -1 ? { ...e.data, id: 0 } : student
//       );
//       console.log('updatedStudents add function', updatedStudents);
//     } else {
//       // Handling existing row update
//       updatedStudents = students.map((student) =>
//         student.id === e.data.id ? { ...e.data } : student
//       );
//       console.log('updatedStudents edit function', updatedStudents);
//       // Call the mutation to update the student
//       updateStudentMutation.mutate(newData, {
//         onSuccess: () => {
//           // On success, maybe refresh the data or show a success toast
//           toast.current?.show({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'Student updated',
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

//   /* -------------------------------------------------------------------------- */
//   /*                                EXPANDED ROWS                               */
//   /* -------------------------------------------------------------------------- */

//   const onRowExpand = (event: DataTableRowEvent) => {
//     console.log('event', event);
//     toast.current?.show({
//       severity: 'info',
//       summary: 'Product Expanded',
//       detail: event.data.id as number,
//       life: 3000,
//     });
//   };

//   const onRowCollapse = (event: DataTableRowEvent) => {
//     toast.current?.show({
//       severity: 'success',
//       summary: 'Product Collapsed',
//       detail: event.data.id as number,
//       life: 3000,
//     });
//   };

//   const expandAll = () => {
//     const _expandedRows: DataTableExpandedRows = {};
//     students.forEach((student) => {
//       if (student.id !== undefined) {
//         _expandedRows[`${student.id}`] = true;
//       }
//     });
//     setExpandedRows(_expandedRows);
//   };

//   const collapseAll = () => {
//     setExpandedRows(undefined);
//   };

//   const allowExpansion = (rowData: Student) => {
//     if (rowData.id) {
//       return rowData?.id > 0;
//     } else {
//       return false;
//     }
//   };

//   const [additionalFormValues, setAdditionalFormValues] =
//     useState<FormValues>();

//   const [interventionDate, setInterventionDate] = useState<Dayjs>();
//   const handleInterventionDateChange = (date: Dayjs | null) => {
//     if (date) {
//       setInterventionDate(date);
//     }
//   };

//   const saveAdditionalData = () => {
//     console.log('additionalFormValues', additionalFormValues);
//     console.log('interventionDate', interventionDate);
//   };

//   const currentDate = dayjs();
//   const currentYear =
//     currentDate.month() === 0 ? currentDate.year() - 1 : currentDate.year();
//   const augustFirstLastYear = dayjs(new Date(currentYear, 7, 1));

//   const [beginningSearchDate, setBeginningSearchDate] =
//     useState<Dayjs>(augustFirstLastYear);
//   const handleBeginningSearchDateChange = (date: Dayjs | null) => {
//     if (date) {
//       setBeginningSearchDate(date);
//     }
//   };

//   const [endingSearchDate, setEndingSearchDate] = useState<Dayjs>(dayjs());
//   const handleEndingSearchDateChange = (date: Dayjs | null) => {
//     if (date) {
//       setEndingSearchDate(date);
//     }
//   };

//   const rowExpansionTemplate = (data: Student) => {
//     const calculateTotalMeetings =
//       data.MeetingAttendees?.filter(
//         (attendee) => attendee.meeting_status === 'Met'
//       ).length ?? 0;

//     const calculateStudentAbsences =
//       data.MeetingAttendees?.filter(
//         (attendee) => attendee.meeting_status === 'Student Absent'
//       ).length ?? 0;

//     const calculateTutorAbsences =
//       data.MeetingAttendees?.filter(
//         (attendee) => attendee.meeting_status === 'Tutor Absent'
//       ).length ?? 0;

//     const calculateStudentUnavailable =
//       data.MeetingAttendees?.filter(
//         (attendee) => attendee.meeting_status === 'Student Unavailable'
//       ).length ?? 0;

//     const calculateTutorUnavailable =
//       data.MeetingAttendees?.filter(
//         (attendee) => attendee.meeting_status === 'Tutor Unavailable'
//       ).length ?? 0;

//     return (
//       <div className="expansion-row">
//         <Card className="expansion-row__item">
//           <h5>Form for {data.first_name}</h5>
//           <TextField
//             id="outlined-multiline-flexible"
//             value={data?.level_lesson}
//             onChange={(e) =>
//               setAdditionalFormValues({
//                 ...additionalFormValues,
//                 level_lesson: e.target.value,
//               })
//             }
//             label="Level/Lesson"
//             className="w-12"
//           />
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DatePicker
//               label="Date Intervention Began"
//               className="w-12"
//               value={dayjs(data.date_intervention_began)}
//               onChange={handleInterventionDateChange}
//             />
//           </LocalizationProvider>

//           <FormControlLabel
//             control={<Switch checked={data.new_student === true} />}
//             label="New"
//           />
//           <FormControlLabel
//             control={<Switch checked={data.withdrew === true} />}
//             label="Withdrew"
//           />
//           <FormControlLabel
//             control={<Switch checked={data.graduated === true} />}
//             label="Graduated"
//           />
//           <FormControlLabel
//             control={<Switch checked={data.moved === true} />}
//             label="Moved"
//           />

//           <TextField
//             id="outlined-multiline-flexible"
//             value={data?.new_location}
//             onChange={(e) =>
//               setAdditionalFormValues({
//                 ...additionalFormValues,
//                 new_location: e.target.value,
//               })
//             }
//             label="Location Moved To"
//             className="w-12"
//           />

//           <TextField
//             id="outlined-multiline-flexible"
//             value={data?.additional_comments}
//             onChange={(e) =>
//               setAdditionalFormValues({
//                 ...additionalFormValues,
//                 additional_comments: e.target.value,
//               })
//             }
//             label="Additional Comments"
//             className="w-12"
//             multiline
//           />
//           <div>
//             <Button onClick={saveAdditionalData}>Save</Button>
//           </div>
//         </Card>
//         <Card className="expansion-row__item">
//           <h5>Meeting Info for {data.first_name}</h5>
//           <div className="flex">
//             <div className="infos">Start Date</div>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Start Date"
//                 className="w-12"
//                 value={augustFirstLastYear}
//                 onChange={handleBeginningSearchDateChange}
//               />
//             </LocalizationProvider>
//           </div>
//           <span>to</span>
//           <div className="flex">
//             <div className="infos">End Date</div>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="End Date"
//                 className="w-12"
//                 value={dayjs()}
//                 onChange={handleEndingSearchDateChange}
//               />
//             </LocalizationProvider>
//           </div>
//           <span>
//             {beginningSearchDate?.toString()} to {endingSearchDate?.toString()}
//           </span>
//           <span>{data.id}</span>
//           {/* The next part of this will need to show the different meeting statuses and how many occur for tha attendee during the time period in the search. */}
//           <div>
//             <span>Meetings</span>
//             <TextField
//               id="outlined-multiline-flexible"
//               value={calculateTotalMeetings}
//               className="w-12"
//             />
//           </div>
//           <div>
//             <span>Student Absences</span>
//             <TextField
//               id="outlined-multiline-flexible"
//               value={calculateStudentAbsences}
//               className="w-12"
//             />
//           </div>
//           <div>
//             <span>Tutor Absences</span>
//             <TextField
//               id="outlined-multiline-flexible"
//               value={calculateTutorAbsences}
//               className="w-12"
//             />
//           </div>
//           <div>
//             <span>Student Unavailable</span>
//             <TextField
//               id="outlined-multiline-flexible"
//               value={calculateStudentUnavailable}
//               className="w-12"
//             />
//           </div>
//           <div>
//             <span>Tutor Unavailable</span>
//             <TextField
//               id="outlined-multiline-flexible"
//               value={calculateTutorUnavailable}
//               className="w-12"
//             />
//           </div>
//         </Card>
//       </div>
//     );
//   };

//   const renderHeader = () => {
//     return (
//       <div className="flex justify-content-between">
//         <div className="flex align-items-center">
//           <IconButton
//             color="secondary"
//             aria-label="add a new student"
//             onClick={addNewStudent}>
//             <AddIcon color="primary" fontSize="large" />
//           </IconButton>
//         </div>
//         <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text />
//         <Button
//           icon="pi pi-minus"
//           label="Collapse All"
//           onClick={collapseAll}
//           text
//         />
//         <div className="flex justify-content-end">
//           <span className="p-input-icon-left">
//             <i className="pi pi-search" />
//             <InputText
//               value={globalFilterValue}
//               onChange={onGlobalFilterChange}
//               placeholder="Keyword Search"
//             />
//           </span>
//         </div>
//       </div>
//     );
//   };
//   const header = renderHeader();

//   const rows = [editingRow, ...students].filter((r) => r != null);

//   if (!getAllStudents.data) return <p>Loading...</p>;

//   return (
//     <Card className="card">
//       <Toast ref={toast} />
//       <DataTable
//         value={rows}
//         editMode="row"
//         onRowEditComplete={onRowEditComplete}
//         expandedRows={expandedRows}
//         onRowToggle={(e) => setExpandedRows(e.data)}
//         onRowExpand={onRowExpand}
//         onRowCollapse={onRowCollapse}
//         rowExpansionTemplate={rowExpansionTemplate}
//         dataKey="id"
//         stripedRows
//         tableStyle={{ minWidth: '60rem' }}
//         filters={filters}
//         filterDisplay="row"
//         globalFilterFields={[
//           'first_name',
//           'last_name',
//           'school',
//           'grade',
//           'home_room_teacher',
//           'intervention_program',
//           'tutorFullName',
//           'date_intervention_began',
//           'calculateTotalMeetings',
//           'services',
//         ]}
//         header={header}
//         emptyMessage="No students match your search.">
//         <Column expander={allowExpansion} style={{ width: '5rem' }} />
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
//           field="student_assigned_id"
//           header="Student ID #"
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
//           field="grade"
//           header="Grade"
//           editor={(options) => gradeEditor(options)}
//           sortable
//         />
//         <Column
//           field="home_room_teacher"
//           header="Home Room Teacher"
//           editor={(options) => textEditor(options)}
//           sortable
//         />
//         <Column
//           field="intervention_program"
//           header="Program"
//           editor={(options) => programEditor(options)}
//           sortable
//         />
//         <Column
//           field="tutorFullName"
//           header="Tutor"
//           style={{ whiteSpace: 'nowrap' }}
//           editor={(options) => tutorEditor(options)}
//           sortable
//         />
//         {/* <Column
//           field="date_intervention_began"
//           header="Date Intervention Began"
//           sortable
//         /> */}
//         <Column
//           field="calculateTotalMeetings"
//           header="Total Meetings"
//           sortable
//         />
//         <Column
//           field="services"
//           header="Services"
//           body={servicesTemplate}
//           editor={(options) => serviceEditor(options)}
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

// export default Students;
