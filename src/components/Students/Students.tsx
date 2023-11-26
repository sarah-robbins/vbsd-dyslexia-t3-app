import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { api } from '@/utils/api';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

import { type Student } from '@/types';

const Students: React.FC = () => {
  const getAllStudents = api.students.getAllStudents.useQuery();
  const [students, setStudents] = useState<Student[]>([]);
  const toast = useRef(null);

  const { data: getStudentsBySchool } =
    api.students.getStudentsBySchool.useQuery(
      // sessionData?.school as string
      'King'
    ) as {
      data: Student[];
    };

  useEffect(() => {
    if (getAllStudents.data) {
      setStudents(getStudentsBySchool);
    }
  }, [getStudentsBySchool]);

  const rows = [...students].filter((r) => r != null);

  const studentNameTemplate = (rowData: Student) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.last_name}, {rowData.first_name}
      </>
    );
  };

  const tutorNameTemplate = (rowData: Student) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.tutor_id}
      </>
    );
  };

  if (!getAllStudents.data) return <p>Loading...</p>;

  return (
    <Card className="card">
      <Toast ref={toast} />
      <DataTable
        value={rows}
        dataKey="id"
        stripedRows
        tableStyle={{ minWidth: '60rem' }}>
        <Column
          body={studentNameTemplate}
          header="Name"
          style={{ whiteSpace: 'nowrap' }}
          sortable
        />
        <Column field="school" header="School" sortable />
        <Column field="grade" header="Grade" sortable />
        <Column field="home_room_teacher" header="Home Room Teacher" sortable />
        <Column field="intervention_program" header="Program" sortable />
        <Column
          body={tutorNameTemplate}
          header="Tutor"
          style={{ whiteSpace: 'nowrap' }}
          sortable
        />
        {/* <Column
          field="date_intervention_began"
          header="Date Intervention Began"
          sortable
        /> */}
        <Column field="totalMeetings" header="Total Meetings" sortable />
        <Column field="services" header="Services" sortable />
      </DataTable>
    </Card>
  );
};

export default Students;
