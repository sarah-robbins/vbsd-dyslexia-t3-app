import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { api } from '@/utils/api';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

import { type dummyStudents } from '@prisma/client';

const Students: React.FC = () => {
  const getAllStudents = api.students.getAllStudents.useQuery();
  const [students, setStudents] = useState<dummyStudents[]>([]);
  const toast = useRef(null);

  useEffect(() => {
    if (getAllStudents.data) {
      setStudents(getAllStudents.data);
    }
  }, [getAllStudents.data]);

  const rows = [...students].filter((r) => r != null);

  const studentNameTemplate = (rowData: dummyStudents) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.last_name}, {rowData.first_name}
      </>
    );
  };

  const tutorNameTemplate = (rowData: dummyStudents) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.tutor_ln}, {rowData.tutor_fn}
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
