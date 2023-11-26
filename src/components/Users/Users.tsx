import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { api } from '@/utils/api';
import { Card } from 'primereact/card';
import { type User } from '@/types';

const Users: React.FC = () => {
  const getAllUsers = api.users.getAllUsers.useQuery();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(getAllUsers.data as User[]);
  }, [getAllUsers]);
  // Table data with new row first

  const userNameTemplate = (rowData: User) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.last_name}, {rowData.first_name}
      </>
    );
  };

  if (!getAllUsers.data) return <p>Loading...</p>;

  return (
    <Card className="card">
      <DataTable
        value={users}
        dataKey="id"
        stripedRows
        tableStyle={{ minWidth: '60rem' }}>
        <Column
          body={userNameTemplate}
          header="Name"
          style={{ whiteSpace: 'nowrap' }}
          sortable
        />
        <Column field="school" header="School" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="phone" header="Phone" sortable />
        <Column field="role" header="Role" sortable />
        <Column field="view" header="View" sortable />
      </DataTable>
    </Card>
  );
};

export default Users;
