// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column, type ColumnEditorOptions } from 'primereact/column';
import { api } from '@/utils/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import Checkbox from '@mui/material/Checkbox';
import { InputText } from 'primereact/inputtext';
import { MenuItem, Select } from '@mui/material';
import ReactDOM from 'react-dom';
import EventIcon from '@mui/icons-material/Event';

import { type dummyUsers } from '@prisma/client';

const Users: React.FC = () => {
  const getAllUsers = api.users.getAllUsers.useQuery();
  console.log('get all users: ', getAllUsers);
  const [users, setUsers] = useState<dummyUsers[]>([]);
  console.log('all users: ', users);

  const [newRow, setNewRow] = useState<dummyUsers | null>(null);
  const toast = useRef(null);
  const [filteredUsers, setFilteredUsers] = useState<dummyUsers[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<dummyUsers[]>([]);
  const selectAllUsersRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (getAllUsers.data) {
      console.log('getAllUsers.data: ', getAllUsers.data);
      setUsers(getAllUsers.data);
      setFilteredUsers(getAllUsers.data);
    }
  }, [getAllUsers.data]);

  //delete user
  const deleteUserMutation = api.users.deleteUser.useMutation();

  const deleteUser = (rowData: dummyUsers) => {
    deleteUserMutation.mutate(rowData.id);
  };

  // create User
  const createUserMutation = api.users.createUser.useMutation({
    onSuccess: (data) => {
      setUsers((prev) => [...prev, data]);
      setNewRow(null);
    },
  });

  const createUser = () => {
    createUserMutation.mutate(newRow);
  };

  // update user
  const updateUserMutation = api.users.updateUser.useMutation();

  const updateUser = (rows: dummyUsers) => {
    const today = new Date();
    const updatedRows = { ...rows, last_edited: today };
    updateUserMutation.mutate(updatedRows);
  };

  useEffect(() => {
    // Update the indeterminate state of the "Check All" checkbox
    if (selectAllUsersRef.current) {
      selectAllUsersRef.current.indeterminate =
        selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
    }
  }, [selectedUsers, filteredUsers]);

  const actionIcons = () => {
    return (
      <div className="flex align-items-center">
        <EventIcon />
      </div>
    );
  };

  const header = (
    <div className="flex flex-wrap justify-content-between gap-2">
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
              email: '',
              phone: '',
              role: '',
              super_admin_role: '',
              picture: '',
              created_at: new Date(),
              view: '',
            })
          }
          text
          className="text-color-secondary"
        />
        <Button
          icon="pi pi-plus"
          label="Delete"
          onClick={() => deleteRows(selectedUsers)}
          text
          className="text-color-secondary"
        />
      </div>
    </div>
  );

  const deleteRows = (id: id) => {
    setNewRow(null);

    deleteUser(id);
  };

  const toggleAllUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(filteredUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some((selectedUser) => selectedUser.id === user.id);
  };

  const toggleUser = (user: dummyUsers) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (isUserSelected(user)) {
        return prevSelectedUsers.filter(
          (selectedUser) => selectedUser.id !== user.id
        );
      } else {
        return [...prevSelectedUsers, user];
      }
    });
  };

  const textEditor = (options: ColumnEditorOptions) => {
    console.log('a change has been made at: ', new Date());
    console.log('options.editorCallback: ', options.editorCallback);
    console.log('options: ', options);
    console.log('options.rowData: ', options.rowData);
    return (
      <InputText
        value={options.value}
        autoFocus
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const [rowData, setRowData] = useState();

  const onCellEditComplete = (e) => {
    // Get row data from event
    const editedRowData = e.data;

    let { newValue, field } = e;

    const today = new Date();

    let editedRowCopy = { ...editedRowData, last_edited: today };
    editedRowCopy[field] = newValue;

    setRowData(editedRowCopy ?? null);
    updateUser(e.newRowData);
  };

  // Custom name editor
  const nameEditor = ({ rowData, editorCallback }) => {
    console.log('a change has been made at: ', new Date());
    console.log('rowData: ', rowData);

    return (
      <>
        <InputText
          value={rowData.first_name}
          onChange={(e) =>
            editorCallback({
              ...rowData,
              first_name: e.target.value,
            })
          }
        />

        <InputText
          value={rowData.last_name}
          onChange={(e) =>
            editorCallback({
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
  const rows = [newRow, ...users].filter((r) => r != null);

  if (!getAllUsers.data) return <p>Loading...</p>;

  return (
    <Card className="card">
      <Toast ref={toast} />
      <DataTable
        value={rows}
        dataKey="id"
        stripedRows
        selection={selectedUsers}
        onSelectionChange={(e) => setSelectedUsers(e.value)}
        // header={header}
        tableStyle={{ minWidth: '60rem' }}>
        {/* <Column body={actionIcons} /> */}
        {/* The following column component should allow a user to check each individual row with a checkbox in the header as well that shows if none are check, all are checked, or an indeterminate amount are checked */}
        {/* <Column
          header={() => (
            <Checkbox
              ref={selectAllUsersRef}
              indeterminate={
                selectedUsers.length > 0 &&
                selectedUsers.length < filteredUsers.length
              }
              checked={
                selectedUsers.length === filteredUsers.length &&
                filteredUsers.length > 0
              }
              onChange={toggleAllUsers}
            />
          )}
          body={(rowData: User) => (
            <Checkbox
              checked={isUserSelected(rowData)}
              onChange={() => toggleUser(rowData)}
            />
          )}
          style={{ width: '3rem' }}
          headerStyle={{ width: '3rem' }}
        /> */}
        <Column
          body={(rowData) => `${rowData.last_name}, ${rowData.first_name}`}
          header="Name"
          style={{ whiteSpace: 'nowrap' }}
          sortable
          // editor={(options) => nameEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="school"
          header="School"
          sortable
          // editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="email"
          header="Email"
          sortable
          // editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="phone"
          header="Phone"
          sortable
          // editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="role"
          header="Role"
          sortable
          // editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
        <Column
          field="view"
          header="View"
          sortable
          // editor={(options) => textEditor(options)}
          onCellEditComplete={onCellEditComplete}
          ref={inputRef}
          autoFocus
          tabIndex={-1}
        />
      </DataTable>
    </Card>
  );
};

export default Users;
