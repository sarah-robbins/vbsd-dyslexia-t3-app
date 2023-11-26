import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column, type ColumnEditorOptions } from 'primereact/column';
import { api } from '@/utils/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import Checkbox from '@mui/material/Checkbox';
// import FormGroup from '@mui/material/FormGroup';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormControl from '@mui/material/FormControl';
import { InputText } from 'primereact/inputtext';
import { MenuItem, Select } from '@mui/material';
import ReactDOM from 'react-dom';
import EventIcon from '@mui/icons-material/Event';

// import { type Students } from '@prisma/client';
// import { TimePicker } from '@mui/x-date-pickers/TimePicker';
// import dayjs from 'dayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { set } from 'zod';
import { type Student } from '@/types';

const Students: React.FC = () => {
  const getAllStudents = api.students.getAllStudents.useQuery();
  const [students, setStudents] = useState<Student[]>([]);

  const [expandedRows, setExpandedRows] = useState({});
  const [newRow, setNewRow] = useState<Student | null>(null);
  const toast = useRef<Toast>(null);
  const toastDelete = useRef<Toast>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const selectAllStudentsRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const grades = [
    { name: 'Kindergarten', value: 'K' },
    { name: '1st Grade', value: '1' },
    { name: '2nd Grade', value: '2' },
    { name: '3rd Grade', value: '3' },
    { name: '4th Grade', value: '4' },
    { name: '5th Grade', value: '5' },
    { name: '6th Grade', value: '6' },
    { name: '7th Grade', value: '7' },
    { name: '8th Grade', value: '8' },
    { name: '9th Grade', value: '9' },
    { name: '10th Grade', value: '10' },
    { name: '11th Grade', value: '11' },
    { name: '12th Grade', value: '12' },
  ];

  useEffect(() => {
    if (getAllStudents.data) {
      setStudents(getAllStudents.data);
      setFilteredStudents(getAllStudents.data);
    }
  }, [getAllStudents.data]);

  //delete student
  const deleteStudentMutation = api.students.deleteStudent.useMutation();

  const deleteStudent = (rows: Student[]) => {
    // Get array of ids
    const idsToDelete = rows.map((r) => r.id);
    const names = rows.map(
      (row) => `${row.first_name ?? ''} ${row.last_name ?? ''}`
    );
    toastDelete.current?.show({
      severity: 'info',
      sticky: true,
      className: 'border-none',
      content: (
        <div
          className="flex flex-column align-items-center"
          style={{ flex: '1' }}>
          <div className="text-center">
            <i
              className="pi pi-exclamation-triangle"
              style={{ fontSize: '3rem' }}></i>
            <div className="font-bold text-xl my-3">
              Are you sure you want to delete {names.join(', ')}?
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                for (const row of rows) {
                  try {
                    if (typeof row.id === 'number') {
                      deleteStudentMutation.mutate({ id: row.id });
                    } else {
                      console.error('Error: Student ID is undefined');
                      // Handle the error appropriately
                    }
                  } catch (error) {
                    console.error(
                      `Error deleting ${row.first_name ?? ''} ${
                        row.last_name ?? ''
                      }`
                    );
                  }
                }

                if (deleteStudentMutation.isSuccess) {
                  toast.current?.show({
                    severity: 'success',
                    summary: 'This student has been deleted.',
                    life: 3000,
                  });
                  // Filter deleted student out of local state
                  setStudents((prev) =>
                    prev.filter((s) => !idsToDelete.includes(s.id))
                  );
                  toastDelete.current?.clear();
                  setSelectedStudents([]);
                }

                if (deleteStudentMutation.isError) {
                  toast.current?.show({
                    severity: 'error',
                    summary:
                      'There was an error, and this student was not deleted.',
                    life: 3000,
                  });
                }
              }}
              type="button"
              label="Confirm"
              className="p-button-success w-6rem"
            />
            <Button
              onClick={() => toastDelete.current?.clear()}
              type="button"
              label="Cancel"
              className="p-button-danger w-6rem"
            />
          </div>
        </div>
      ),
    });
  };

  // // create Student
  // const createStudentMutation = api.students.createStudent.useMutation({
  //   onSuccess: (data) => {
  //     setStudents((prev) => [...prev, data]);
  //     setNewRow(null);
  //   },
  // });

  // const createStudent = () => {
  //   createStudentMutation.mutate(newRow);
  // };

  // update student

  const updateStudentMutation = api.students.updateStudent.useMutation();

  const updateStudent = (rows: Student) => {
    const today = new Date();
    const updatedStudent = {
      ...rows,
      last_edited: today,
      // Explicitly convert null fields to undefined if required
      school: rows.school !== null ? rows.school : undefined,
      first_name: rows.first_name !== null ? rows.first_name : undefined,
      last_name: rows.last_name !== null ? rows.last_name : undefined,
      grade: rows.grade !== null ? rows.grade : undefined,
      home_room_teacher:
        rows.home_room_teacher !== null ? rows.home_room_teacher : undefined,
      tutor_id: rows.tutor_id !== null ? rows.tutor_id : undefined,
      intervention_program:
        rows.intervention_program !== null
          ? rows.intervention_program
          : undefined,
      level_lesson: rows.level_lesson !== null ? rows.level_lesson : undefined,
      date_intervention_began:
        rows.date_intervention_began !== null
          ? rows.date_intervention_began
          : undefined,
      services: rows.services !== null ? rows.services : undefined,
      new_student: rows.new_student !== null ? rows.new_student : undefined,
      moved: rows.moved !== null ? rows.moved : undefined,
      new_location: rows.new_location !== null ? rows.new_location : undefined,
      withdrew: rows.withdrew !== null ? rows.withdrew : undefined,
      additional_comments:
        rows.additional_comments !== null
          ? rows.additional_comments
          : undefined,

      // Repeat the above for any other fields that may have a similar mismatch
    };
    updateStudentMutation.mutate(updatedStudent);
  };

  const onRowExpand = (row: Student) => {
    setLoading(true);
    // const { data } = api.students.getScheduleByStudentId.useQuery({
    //   id: row.id,
    // });
    setLoading(false);
  };

  useEffect(() => {
    // Update the indeterminate state of the "Check All" checkbox
    if (selectAllStudentsRef.current) {
      selectAllStudentsRef.current.indeterminate =
        selectedStudents.length > 0 &&
        selectedStudents.length < filteredStudents.length;
    }
  }, [selectedStudents, filteredStudents]);

  // const statusOrderBodyTemplate = (rowData: { status: string }) => {
  //   return (
  //     <Tag
  //       value={rowData.status.toLowerCase()}
  //       severity={getOrderSeverity(rowData)}></Tag>
  //   );
  // };

  // const searchBodyTemplate = () => {
  //   return <Button icon="pi pi-search" />;
  // };

  // const getOrderSeverity = (order: { status: any }) => {
  //   switch (order.status) {
  //     case 'DELIVERED':
  //       return 'success';

  //     case 'CANCELLED':
  //       return 'danger';

  //     case 'PENDING':
  //       return 'warning';

  //     case 'RETURNED':
  //       return 'info';

  //     default:
  //       return null;
  //   }
  // };

  /* -------------------------------------------------------------------------- */
  /*                              STUDENT SCHEDULE                              */
  /* -------------------------------------------------------------------------- */

  // const addSchedule = async (schedule) => {
  //   toast.current?.show({
  //     severity: 'success',
  //     summary: 'This has been saved.',
  //     // detail: 'test',
  //     life: 3000,
  //   });
  // };

  // const editSchedule = (row) => {
  //   // setEditingRow(student.id);

  //   toast.current?.show({
  //     severity: 'success',
  //     summary: 'This has been edited.',
  //     // detail: 'test',
  //     life: 3000,
  //   });
  // };

  /* -------------------------------------------------------------------------- */
  /*                           ROW EXPANSION CONTROLS                           */
  /* -------------------------------------------------------------------------- */
  const onRowCollapse = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Student Collapsed',
      // detail: event.data.name,
      life: 3000,
    });
  };

  const expandAll = () => {
    const _expandedRows: { [key: string]: boolean } = {};

    students.forEach(
      (student: Student) => (_expandedRows[`${student.id}`] = true)
    );

    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  const allowExpansion = (rowData: Student) => {
    return rowData.first_name.length > 0;
  };

  /* ------------------------ Template for Expanded Row ----------------------- */
  // const [schedule, setSchedule] = useState({
  //   sunday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  //   monday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  //   tuesday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  //   wednesday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  //   thursday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  //   friday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  //   saturday: {
  //     startTime: null,
  //     endTime: null,
  //   },
  // });

  // const { data } = api.students.getStudentSchedule.useQuery(Number());
  // setSchedule(data);

  // const [state, setState] = React.useState({
  //   sunday: false,
  //   monday: false,
  //   tuesday: false,
  //   wednesday: false,
  //   thursday: false,
  //   friday: false,
  //   saturday: false,
  // });

  // const handleCheckedDayChange = (day) => {
  //   setState((prev) => ({
  //     ...prev,
  //     [day]: !prev[day],
  //   }));
  // };

  // const { sunday, monday, tuesday, wednesday, thursday, friday, saturday } =
  //   state;

  // const setDaySchedule = (day: string, startTime: Date, endTime: Date) => {
  //   setSchedule({
  //     ...schedule,
  //     [day]: {
  //       startTime: startTime,
  //       endTime: endTime,
  //     },
  //   });
  // };

  const rowExpansionTemplate = () => {
    return (
      <div className="flex  flex-column lg:flex-row gap-4">
        {/* <Card className="w-full">meetings stats</Card>
        <Card className="w-full">
          <h3>Schedule</h3>
          <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
            <FormGroup className="flex flex-row">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sunday}
                    onChange={() => handleCheckedDayChange('sunday')}
                    name="sunday"
                  />
                }
                label="Sun"
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={monday}
                    onChange={() => handleCheckedDayChange('monday')}
                    name="monday"
                  />
                }
                label="Mon"
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tuesday}
                    onChange={() => handleCheckedDayChange('tuesday')}
                    name="tuesday"
                  />
                }
                label="Tues"
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={wednesday}
                    onChange={() => handleCheckedDayChange('wednesday')}
                    name="wednesday"
                  />
                }
                label="Wed"
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={thursday}
                    onChange={() => handleCheckedDayChange('thursday')}
                    name="thursday"
                  />
                }
                label="Thur"
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={friday}
                    onChange={() => handleCheckedDayChange('friday')}
                    name="friday"
                  />
                }
                label="Fri"
                labelPlacement="top"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={saturday}
                    onChange={() => handleCheckedDayChange('saturday')}
                    name="saturday"
                  />
                }
                label="Sat"
                labelPlacement="top"
              />
            </FormGroup>
          </FormControl>
          <div>
            <div className="flex flex-column no-wrap gap-2 ">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {sunday && (
                  <>
                    <h4>Sunday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.sunday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'sunday',
                            newStartTime,
                            schedule.sunday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.sunday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'sunday',
                            schedule.sunday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
                {monday && (
                  <>
                    <h4>Monday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.monday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'monday',
                            newStartTime,
                            schedule.monday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.monday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'monday',
                            schedule.monday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
                {tuesday && (
                  <>
                    <h4>Tuesday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.tuesday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'tuesday',
                            newStartTime,
                            schedule.tuesday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.tuesday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'tuesday',
                            schedule.tuesday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
                {wednesday && (
                  <>
                    <h4>Wednesday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.wednesday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'wednesday',
                            newStartTime,
                            schedule.wednesday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.wednesday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'wednesday',
                            schedule.wednesday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
                {thursday && (
                  <>
                    <h4>Thursday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.thursday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'thursday',
                            newStartTime,
                            schedule.thursday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.thursday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'thursday',
                            schedule.thursday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
                {friday && (
                  <>
                    <h4>Friday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.friday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'friday',
                            newStartTime,
                            schedule.friday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.friday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'friday',
                            schedule.friday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
                {saturday && (
                  <>
                    <h4>Saturday</h4>
                    <div className="flex flex-row align-items-center no-wrap gap-2">
                      <TimePicker
                        value={schedule.saturday.startTime}
                        onChange={(newStartTime) =>
                          setDaySchedule(
                            'saturday',
                            newStartTime,
                            schedule.saturday.endTime
                          )
                        }
                      />
                      <span>to</span>
                      <TimePicker
                        value={schedule.saturday.endTime}
                        onChange={(newEndTime) =>
                          setDaySchedule(
                            'saturday',
                            schedule.saturday.startTime,
                            newEndTime
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </LocalizationProvider>
            </div>
          </div>
          <div className="scheduleActionButtons flex gap-2">
            <Button label="Save" onClick={(row) => addSchedule(row.id)} />
            <Button label="Edit" onClick={(event) => editSchedule(event.id)} />
          </div>
        </Card> */}
      </div>
    );
  };

  const actionIcons = () => {
    return (
      <div className="flex align-items-center">
        <EventIcon />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap justify-content-between gap-2">
      <Toast ref={toast} />
      <Toast ref={toastDelete} />

      <div className="flex gap-2">
        <Button
          icon="pi pi-plus"
          label="Add"
          onClick={() =>
            setNewRow({
              id: 0,
              school: '',
              first_name: '',
              last_name: '',
              grade: '',
              home_room_teacher: '',
              tutor_ln: '',
              tutor_fn: '',
              intervention_program: '',
              level_lesson: '',
              date_intervention_began: new Date(),
              services: '',
              new_student: false,
              moved: false,
              new_location: '',
              withdrew: false,
              additional_comments: '',
              created_at: new Date(),
              last_edited: null,
              schedule: {},
            })
          }
          text
          className="text-color-secondary"
        />
        <Button
          icon="pi pi-plus"
          label="Delete"
          onClick={() => deleteRows(selectedStudents)}
          text
          className="text-color-secondary"
        />
      </div>
      <div className="flex gap-2">
        <Button
          icon="pi pi-plus"
          label="Expand All"
          onClick={expandAll}
          text
          className="text-color-secondary"
        />
        <Button
          icon="pi pi-minus"
          label="Collapse All"
          onClick={collapseAll}
          text
          className="text-color-secondary"
        />
      </div>
    </div>
  );

  const deleteRows = (rows: Student[]) => {
    setNewRow(null);

    deleteStudent(rows);
  };

  const toggleAllStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents);
    } else {
      setSelectedStudents([]);
    }
  };

  const isStudentSelected = (student: Student) => {
    return selectedStudents.some(
      (selectedStudent) => selectedStudent.id === student.id
    );
  };

  const toggleStudent = (student: Student) => {
    setSelectedStudents((prevSelectedStudents) => {
      if (isStudentSelected(student)) {
        return prevSelectedStudents.filter(
          (selectedStudent) => selectedStudent.id !== student.id
        );
      } else {
        return [...prevSelectedStudents, student];
      }
    });
  };

  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        value={options.value as string}
        autoFocus
        onChange={(e) => options.editorCallback?.(e.target.value)}
      />
    );
  };

  const [rowData, setRowData] = useState<Student>();

  const onCellEditComplete = (options: ColumnEvent) => {
    // Get row data from event
    const editedRowData = options.rowData;

    let { newValue, field } = options;

    const today = new Date();

    let editedRowCopy = { ...editedRowData, last_edited: today };
    editedRowCopy[field] = newValue;

    setRowData(editedRowCopy ?? null);
    updateStudent(options.newRowData);
  };

  // Custom name editor
  const nameEditor = (options: ColumnEditorOptions) => {
    return (
      <>
        <InputText
          value={options.rowData.first_name as string}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            options.editorCallback({
              ...options,
              first_name: e.target.value,
            })
          }
        />

        <InputText
          value={options.rowData.last_name}
          onChange={(e) =>
            options.editorCallback({
              ...rowData,
              last_name: e.target.value,
            })
          }
        />
      </>
    );
  };

  const inputRef = useRef();

  // const onCellFocus = (e) => {
  //   e.preventDefault();
  //   inputRef.current.focus();
  // };

  // Table data with new row first
  const rows = [newRow, ...students].filter((r) => r != null);

  if (!getAllStudents.data) return <p>Loading...</p>;

  return (
    <Card className="card">
      <Toast ref={toast} />
      <DataTable
        value={rows}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        onRowExpand={onRowExpand}
        onRowCollapse={onRowCollapse}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        stripedRows
        selection={selectedStudents}
        onSelectionChange={(e) => setSelectedStudents(e.value)}
        header={header}
        tableStyle={{ minWidth: '60rem' }}>
        <Column expander={allowExpansion} style={{ width: '5rem' }} />
        <Column body={actionIcons} />
        {/* The following column component should allow a user to check each individual row with a checkbox in the header as well that shows if none are check, all are checked, or an indeterminate amount are checked */}
        <Column
          header={() => (
            <Checkbox
              ref={selectAllStudentsRef}
              indeterminate={
                selectedStudents.length > 0 &&
                selectedStudents.length < filteredStudents.length
              }
              checked={
                selectedStudents.length === filteredStudents.length &&
                filteredStudents.length > 0
              }
              onChange={toggleAllStudents}
            />
          )}
          body={(rowData: Student) => (
            <Checkbox
              checked={isStudentSelected(rowData)}
              onChange={() => toggleStudent(rowData)}
            />
          )}
          style={{ width: '3rem' }}
          headerStyle={{ width: '3rem' }}
        />
        <Column
          body={(rowData) => `${rowData.last_name}, ${rowData.first_name}`}
          header="Name"
          style={{ whiteSpace: 'nowrap' }}
          sortable
          editor={(options) => nameEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="school"
          header="School"
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="grade"
          header="Grade"
          sortable
          // editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="grade"
          header="Grade Select"
          editor={(options) => {
            return ReactDOM.createPortal(
              <Select
                value={options.value}
                onChange={(e) => options.editorCallback(e.value)}>
                {grades.map((grade) => (
                  <MenuItem key={grade.value} value={grade.value}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>,
              document.body
            );
          }}
        />
        <Column
          field="home_room_teacher"
          header="Home Room Teacher"
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="intervention_program"
          header="Program"
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          body={(rowData) => rowData.tutor.id}
          header="Tutor"
          style={{ whiteSpace: 'nowrap' }}
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        {/* <Column
          field="date_intervention_began"
          header="Date Intervention Began"
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        /> */}
        <Column
          field="totalMeetings"
          header="Total Meetings"
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="services"
          header="Services"
          sortable
          editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
      </DataTable>
    </Card>
  );
};

export default Students;
