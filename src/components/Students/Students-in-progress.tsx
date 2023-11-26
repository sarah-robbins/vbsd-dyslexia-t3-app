// import React, { useState, useEffect, useRef } from 'react';
// import { DataTable } from 'primereact/datatable';
// import {
//   Column,
//   ColumnEvent,
//   type ColumnEditorOptions,
// } from 'primereact/column';
// import { api } from '@/utils/api';
// import { Button } from 'primereact/button';
// import { Toast } from 'primereact/toast';
// import { Card } from 'primereact/card';
// import Checkbox from '@mui/material/Checkbox';
// import { InputText } from 'primereact/inputtext';
// import { MenuItem, Select } from '@mui/material';
// import ReactDOM from 'react-dom';
// import EventIcon from '@mui/icons-material/Event';
// import { type Student } from '@/types';
// import { Dropdown } from 'primereact/dropdown';
// import { Dayjs } from 'dayjs';

// const StudentsInProgress: React.FC = () => {
//   const getAllStudents = api.students.getAllStudents.useQuery();
//   const [students, setStudents] = useState<Student[]>([]);

//   const [expandedRows, setExpandedRows] = useState({});
//   const [newRow, setNewRow] = useState<Student | null>(null);
//   const toast = useRef<Toast>(null);
//   const toastDelete = useRef<Toast>(null);
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
//   const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
//   const selectAllStudentsRef = useRef<HTMLInputElement>(null);
//   const [loading, setLoading] = useState(false);

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

//   useEffect(() => {
//     if (getAllStudents.data) {
//       setStudents(getAllStudents.data);
//       setFilteredStudents(getAllStudents.data);
//     }
//   }, [getAllStudents.data]);

//   //delete student
//   const deleteStudentMutation = api.students.deleteStudent.useMutation();

//   const deleteStudent = (rows: Student[]) => {
//     // Get array of ids
//     const idsToDelete = rows.map((r) => r.id);
//     const names = rows.map(
//       (row) => `${row.first_name ?? ''} ${row.last_name ?? ''}`
//     );
//     toastDelete.current?.show({
//       severity: 'info',
//       sticky: true,
//       className: 'border-none',
//       content: (
//         <div
//           className="flex flex-column align-items-center"
//           style={{ flex: '1' }}>
//           <div className="text-center">
//             <i
//               className="pi pi-exclamation-triangle"
//               style={{ fontSize: '3rem' }}></i>
//             <div className="font-bold text-xl my-3">
//               Are you sure you want to delete {names.join(', ')}?
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               onClick={() => {
//                 for (const row of rows) {
//                   try {
//                     if (typeof row.id === 'number') {
//                       deleteStudentMutation.mutate({ id: row.id });
//                     } else {
//                       console.error('Error: Student ID is undefined');
//                       // Handle the error appropriately
//                     }
//                   } catch (error) {
//                     console.error(
//                       `Error deleting ${row.first_name ?? ''} ${
//                         row.last_name ?? ''
//                       }`
//                     );
//                   }
//                 }

//                 if (deleteStudentMutation.isSuccess) {
//                   toast.current?.show({
//                     severity: 'success',
//                     summary: 'This student has been deleted.',
//                     life: 3000,
//                   });
//                   // Filter deleted student out of local state
//                   setStudents((prev) =>
//                     prev.filter((s) => !idsToDelete.includes(s.id))
//                   );
//                   toastDelete.current?.clear();
//                   setSelectedStudents([]);
//                 }

//                 if (deleteStudentMutation.isError) {
//                   toast.current?.show({
//                     severity: 'error',
//                     summary:
//                       'There was an error, and this student was not deleted.',
//                     life: 3000,
//                   });
//                 }
//               }}
//               type="button"
//               label="Confirm"
//               className="p-button-success w-6rem"
//             />
//             <Button
//               onClick={() => toastDelete.current?.clear()}
//               type="button"
//               label="Cancel"
//               className="p-button-danger w-6rem"
//             />
//           </div>
//         </div>
//       ),
//     });
//   };

//   // // create Student
//   // const createStudentMutation = api.students.createStudent.useMutation({
//   //   onSuccess: (data) => {
//   //     setStudents((prev) => [...prev, data]);
//   //     setNewRow(null);
//   //   },
//   // });

//   // const createStudent = () => {
//   //   createStudentMutation.mutate(newRow);
//   // };

//   // update student

//   const updateStudentMutation = api.students.updateStudent.useMutation();

//   const updateStudent = (rows: Student) => {
//     const today = new Date();
//     const updatedStudent = {
//       ...rows,
//       last_edited: today,
//       // Explicitly convert null fields to undefined if required
//       school: rows.school !== null ? rows.school : undefined,
//       first_name: rows.first_name !== null ? rows.first_name : undefined,
//       last_name: rows.last_name !== null ? rows.last_name : undefined,
//       grade: rows.grade,
//       home_room_teacher:
//         rows.home_room_teacher !== null ? rows.home_room_teacher : undefined,
//       tutor_id: rows.tutor_id !== null ? rows.tutor_id : undefined,
//       intervention_program:
//         rows.intervention_program !== null
//           ? rows.intervention_program
//           : undefined,
//       level_lesson: rows.level_lesson !== null ? rows.level_lesson : undefined,
//       date_intervention_began: rows.date_intervention_began
//         ? rows.date_intervention_began
//         : undefined,
//       services: rows.services !== null ? rows.services : undefined,
//       new_student: rows.new_student !== null ? rows.new_student : undefined,
//       moved: rows.moved !== null ? rows.moved : undefined,
//       new_location: rows.new_location !== null ? rows.new_location : undefined,
//       withdrew: rows.withdrew !== null ? rows.withdrew : undefined,
//       additional_comments:
//         rows.additional_comments !== null
//           ? rows.additional_comments
//           : undefined,

//       // Repeat the above for any other fields that may have a similar mismatch
//     };
//     updateStudentMutation.mutate(updatedStudent);
//   };

//   // const onRowExpand = (row: Student) => {
//   //   setLoading(true);
//   //   // const { data } = api.students.getScheduleByStudentId.useQuery({
//   //   //   id: row.id,
//   //   // });
//   //   setLoading(false);
//   // };

//   useEffect(() => {
//     // Update the indeterminate state of the "Check All" checkbox
//     if (selectAllStudentsRef.current) {
//       selectAllStudentsRef.current.indeterminate =
//         selectedStudents.length > 0 &&
//         selectedStudents.length < filteredStudents.length;
//     }
//   }, [selectedStudents, filteredStudents]);

//   /* -------------------------------------------------------------------------- */
//   /*                           ROW EXPANSION CONTROLS                           */
//   /* -------------------------------------------------------------------------- */
//   // const onRowCollapse = () => {
//   //   toast.current?.show({
//   //     severity: 'success',
//   //     summary: 'Student Collapsed',
//   //     // detail: event.data.name,
//   //     life: 3000,
//   //   });
//   // };

//   // const expandAll = () => {
//   //   const _expandedRows: { [key: string]: boolean } = {};

//   //   students.forEach(
//   //     (student: Student) => (_expandedRows[`${student.id}`] = true)
//   //   );

//   //   setExpandedRows(_expandedRows);
//   // };

//   // const collapseAll = () => {
//   //   setExpandedRows({});
//   // };

//   // const allowExpansion = (rowData: Student) => {
//   //   return rowData.first_name.length > 0;
//   // };

//   const actionIcons = () => {
//     return (
//       <div className="flex align-items-center">
//         <EventIcon />
//       </div>
//     );
//   };

//   const header = (
//     <div className="flex flex-wrap justify-content-between gap-2">
//       <Toast ref={toast} />
//       <Toast ref={toastDelete} />

//       <div className="flex gap-2">
//         <Button
//           icon="pi pi-plus"
//           label="Add"
//           onClick={() =>
//             setNewRow({
//               id: 0,
//               school: '',
//               first_name: '',
//               last_name: '',
//               grade: '',
//               home_room_teacher: '',
//               tutor_id: 0,
//               intervention_program: '',
//               level_lesson: '',
//               date_intervention_began: new Dayjs(),
//               services: '',
//               new_student: false,
//               moved: false,
//               new_location: '',
//               withdrew: false,
//               additional_comments: '',
//               created_at: new Dayjs(),
//               last_edited: null,
//               schedule: {},
//             })
//           }
//           text
//           className="text-color-secondary"
//         />
//         <Button
//           icon="pi pi-plus"
//           label="Delete"
//           onClick={() => deleteRows(selectedStudents)}
//           text
//           className="text-color-secondary"
//         />
//       </div>
//       {/* <div className="flex gap-2">
//         <Button
//           icon="pi pi-plus"
//           label="Expand All"
//           onClick={expandAll}
//           text
//           className="text-color-secondary"
//         />
//         <Button
//           icon="pi pi-minus"
//           label="Collapse All"
//           onClick={collapseAll}
//           text
//           className="text-color-secondary"
//         />
//       </div> */}
//     </div>
//   );

//   const deleteRows = (rows: Student[]) => {
//     setNewRow(null);

//     deleteStudent(rows);
//   };

//   const toggleAllStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.checked) {
//       setSelectedStudents(filteredStudents);
//     } else {
//       setSelectedStudents([]);
//     }
//   };

//   const isStudentSelected = (student: Student) => {
//     return selectedStudents.some(
//       (selectedStudent) => selectedStudent.id === student.id
//     );
//   };

//   const toggleStudent = (student: Student) => {
//     setSelectedStudents((prevSelectedStudents) => {
//       if (isStudentSelected(student)) {
//         return prevSelectedStudents.filter(
//           (selectedStudent) => selectedStudent.id !== student.id
//         );
//       } else {
//         return [...prevSelectedStudents, student];
//       }
//     });
//   };

//   const textEditor = (options: ColumnEditorOptions) => {
//     return (
//       <InputText
//         value={options.value as string}
//         autoFocus
//         onChange={(e) => options.editorCallback?.(e.target.value)}
//       />
//     );
//   };

//   const [rowData, setRowData] = useState<Student>();

//   const onCellEditComplete = (options: ColumnEvent) => {
//     // Get row data from event
//     const editedRowData = options.rowData;

//     const { newValue, field } = options;

//     const today = new Date();

//     const editedRowCopy = { ...editedRowData, last_edited: today };
//     editedRowCopy[field] = newValue;

//     setRowData(editedRowCopy ?? null);
//     updateStudent(options.newRowData);
//   };

//   // Custom name editor
//   const gradeEditor = (options: ColumnEditorOptions) => {
//     return (
//       <Dropdown
//         value={options.value as string}
//         options={grades}
//         onChange={(e) => options.editorCallback?.(e.target.value)}
//         placeholder="Select a Grade"
//         itemTemplate={(option) => {
//           return <span>{option}</span>; // Render the 'name' property as JSX
//         }}
//       />
//     );
//   };

//   const gradeBodyTemplate = (rowData: Student) => {
//     return <span>{rowData.grade}</span>;
//   };

//   const inputRef = useRef();

//   // const onCellFocus = (e) => {
//   //   e.preventDefault();
//   //   inputRef.current.focus();
//   // };

//   // Table data with new row first
//   const rows = [newRow, ...students].filter((r) => r != null);

//   if (!getAllStudents.data) return <p>Loading...</p>;

//   return (
//     <Card className="card">
//       <Toast ref={toast} />
//       <DataTable
//         value={rows}
//         // expandedRows={expandedRows}
//         // onRowToggle={(e) => setExpandedRows(e.data)}
//         // onRowExpand={onRowExpand}
//         // onRowCollapse={onRowCollapse}
//         dataKey="id"
//         stripedRows
//         selection={selectedStudents}
//         onSelectionChange={(e) => setSelectedStudents(e.value)}
//         header={header}
//         tableStyle={{ minWidth: '60rem' }}>
//         {/* <Column expander={allowExpansion} style={{ width: '5rem' }} /> */}
//         <Column body={actionIcons} />
//         {/* The following column component should allow a user to check each individual row with a checkbox in the header as well that shows if none are check, all are checked, or an indeterminate amount are checked */}
//         <Column
//           header={() => (
//             <Checkbox
//               ref={selectAllStudentsRef}
//               indeterminate={
//                 selectedStudents.length > 0 &&
//                 selectedStudents.length < filteredStudents.length
//               }
//               checked={
//                 selectedStudents.length === filteredStudents.length &&
//                 filteredStudents.length > 0
//               }
//               onChange={toggleAllStudents}
//             />
//           )}
//           body={(rowData: Student) => (
//             <Checkbox
//               checked={isStudentSelected(rowData)}
//               onChange={() => toggleStudent(rowData)}
//             />
//           )}
//           style={{ width: '3rem' }}
//           headerStyle={{ width: '3rem' }}
//         />
//         <Column
//           field="first_name"
//           header="First Name"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//         <Column
//           field="last_name"
//           header="Last Name"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//         <Column
//           field="school"
//           header="School"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//         {/* <Column
//           field="grade"
//           header="Grade"
//           sortable
//           // editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         /> */}
//         <Column
//           field="grade"
//           header="Grade Select"
//           body={gradeBodyTemplate}
//           editor={(options) => gradeEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           style={{ width: '20%' }}
//         />

//         {/* <Column
//           field="grade"
//           header="Grade Select"
//           editor={(options) => {
//             return ReactDOM.createPortal(
//               <Select
//                 value={options.value}
//                 onChange={(e) => options.editorCallback(e.value)}>
//                 {grades.map((grade) => (
//                   <MenuItem key={grade.value} value={grade.value}>
//                     {grade.name}
//                   </MenuItem>
//                 ))}
//               </Select>,
//               document.body
//             );
//           }}
//         /> */}
//         <Column
//           field="home_room_teacher"
//           header="Home Room Teacher"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//         <Column
//           field="intervention_program"
//           header="Program"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//         <Column
//           field="tutor_id"
//           header="Tutor ID"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//         {/* <Column
//           field="date_intervention_began"
//           header="Date Intervention Began"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         /> */}
//         <Column
//           field="totalMeetings"
//           header="Total Meetings"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//         />
//         <Column
//           field="services"
//           header="Services"
//           sortable
//           editor={(options) => textEditor(options)}
//           onCellEditComplete={onCellEditComplete}
//           ref={inputRef}
//           autoFocus
//           tabIndex={-1}
//         />
//       </DataTable>
//     </Card>
//   );
// };

// export default StudentsInProgress;
