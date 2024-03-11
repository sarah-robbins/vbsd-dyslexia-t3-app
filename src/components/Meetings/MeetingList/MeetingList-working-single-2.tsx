// import React, { useState, useEffect, useRef } from "react";
// import { Card } from "primereact/card";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import Chip from "@mui/material/Chip";
// import Checkbox from "@mui/material/Checkbox";
// import dayjs, { type Dayjs } from "dayjs";
// import { type Meeting, type MeetingAttendees, type Student } from "@/types";
// import { api } from "@/utils/api";

// interface Props {
//   selectedDate: Dayjs;
//   getDatedMeetings: Meeting[];
//   meetings: Meeting[];
//   getStudentsBySchool: Student[];
//   selectedMeetings: Meeting[];
//   setSelectedMeetings: (meetings: Meeting[]) => void;
//   getAttendeesByMeeting: MeetingAttendees[];
//   selectedMeetingAttendees: MeetingAttendees[];
//   setSelectedMeetingAttendees: (
//     selectedMeetingAttendees: MeetingAttendees[]
//   ) => void;
//   setAttendees: (attendees: MeetingAttendees[]) => void;
// }

// const MeetingList: React.FC<Props> = ({
//   selectedDate,
//   getDatedMeetings = [],
//   selectedMeetings = [],
//   meetings = [],
//   getStudentsBySchool = [],
//   setSelectedMeetings = () => {
//     meetings;
//   },
//   getAttendeesByMeeting = [],
//   selectedMeetingAttendees = [],
//   setSelectedMeetingAttendees = () => {
//     selectedMeetingAttendees;
//   },
//   setAttendees = () => {
//     getAttendeesByMeeting;
//   },
// }) => {
//   const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
//   // const [selectedMeetings, setSelectedMeetings] = useState<Meeting[]>([]);
//   // const [selectedNames] = useState<string[]>([]);
//   const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
//   // useEffect(() => {
//   //   if (selectedNames.length > 0) {
//   //     const filteredData = getDatedMeetings.filter((meeting: Meeting) =>
//   //       selectedNames.includes(meeting.name.toString())
//   //     );
//   //     setFilteredMeetings(filteredData);
//   //     // setIsMeetingSelected(true);
//   //   }
//   // }, [getDatedMeetings, selectedNames]);

//   // const handleNameSelect = (names: string[]) => {
//   //   setSelectedNames(names);
//   // };

//   useEffect(() => {
//     if (!selectedDate) {
//       setFilteredMeetings([]);
//       return;
//     }

//     const filtered = getDatedMeetings
//       .map((meeting) => ({
//         ...meeting,
//         dateString: dayjs(meeting.start).format("YYYY-MM-DD"),
//       }))
//       .filter((meeting) => {
//         const meetingDate = dayjs(meeting.start);
//         return meetingDate.isSame(selectedDate, "day");
//       });
//     setFilteredMeetings(filtered);
//   }, [getDatedMeetings, selectedDate]);

//   useEffect(() => {
//     // Update the indeterminate state of the "Check All" checkbox
//     if (selectAllCheckboxRef.current) {
//       selectAllCheckboxRef.current.indeterminate =
//         selectedMeetings.length > 0 &&
//         selectedMeetings.length < filteredMeetings.length;
//     }
//   }, [selectedMeetings, filteredMeetings]);

//   const headerTemplate = (data: Meeting) => {
//     const originalDate = dayjs(data.start);
//     const newDate = originalDate.startOf("day").toDate();

//     const options: Intl.DateTimeFormatOptions = {
//       weekday: "long",
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     };

//     const getOrdinalSuffix = (day: number) => {
//       if (day >= 11 && day <= 13) {
//         return "th";
//       }
//       const lastDigit = day % 10;
//       switch (lastDigit) {
//         case 1:
//           return "st";
//         case 2:
//           return "nd";
//         case 3:
//           return "rd";
//         default:
//           return "th";
//       }
//     };

//     const formatter = new Intl.DateTimeFormat("en-US", options);
//     const formattedDate = formatter.format(newDate);
//     const dayOfMonth = newDate.getDate();
//     const ordinalSuffix = getOrdinalSuffix(dayOfMonth);

//     const finalFormattedDate = formattedDate.replace(
//       new RegExp(`\\b${dayOfMonth}\\b`),
//       `${dayOfMonth}${ordinalSuffix}`
//     );

//     return (
//       <React.Fragment>
//         <div className="flex justify-content-between">
//           <div className="flex align-items-center gap-2">
//             <span className="font-bold">{finalFormattedDate}</span>
//           </div>
//           <td colSpan={5}>
//             <div className="flex justify-content-end font-bold w-full">
//               Total Meetings:{" "}
//               {calculateMeetingTotal(data.start?.toString() ?? "")}
//             </div>
//           </td>
//         </div>
//       </React.Fragment>
//     );
//   };

//   const footerTemplate = () => {
//     return <td colSpan={5} className="h-auto"></td>;
//   };

//   const statusBodyTemplate = (rowData: Meeting) => {
//     return (
//       <Chip
//         color={getStatusForTable(getMeetingStatus(rowData) ?? "")}
//         label={getMeetingStatus(rowData)}
//         className="meeting-status-chips"
//       />
//     );
//   };

//   const formatMeetingTime = (data: Meeting) => {
//     const { start, end } = data;

//     const formatTime = (time: Date | Dayjs | null): string => {
//       const date = dayjs(time ? time.toISOString() : undefined);
//       const hours = date.hour();
//       const minutes = date.minute();

//       const isPM = hours >= 12;
//       const formattedHours = isPM ? hours % 12 || 12 : hours;
//       const formattedMinutes = minutes.toString().padStart(2, "0");
//       const period = isPM ? "pm" : "am";

//       return `${formattedHours}:${formattedMinutes}${period}`;
//     };

//     const startTime = formatTime(start);
//     const endTime = formatTime(end);
//     const timeSpan = `${startTime} - ${endTime}`;

//     return (
//       <div className="flex align-items-center gap-2">
//         <span>{timeSpan}</span>
//       </div>
//     );
//   };
//   // calculate the total amount of meetings on a given day in the meeting list
//   const calculateMeetingTotal = (start: string): number => {
//     let total = 0;

//     // Convert start string to a dayjs object
//     const startDate = dayjs(start);

//     // Extract day, month, and year from start
//     const startDay = startDate.date();
//     const startMonth = startDate.month();
//     const startYear = startDate.year();

//     if (getDatedMeetings) {
//       for (const meeting of getDatedMeetings) {
//         // Convert meeting.start string to a dayjs object
//         const meetingDate = dayjs(meeting.start);

//         // Extract day, month, and year from meeting.start
//         const meetingDay = meetingDate.date();
//         const meetingMonth = meetingDate.month();
//         const meetingYear = meetingDate.year();

//         // Compare extracted values
//         if (
//           meetingDay === startDay &&
//           meetingMonth === startMonth &&
//           meetingYear === startYear
//         ) {
//           total++;
//         }
//       }
//     }
//     return total;
//   };

//   const { data: attendees } = api.attendees.getAttendeesByMeeting.useQuery(
//     selectedMeetings[0]?.id ?? 0
//   ) as {
//     data: MeetingAttendees[];
//   };
//   useEffect(() => {
//     if (selectedMeetings.length === 0) {
//       setSelectedMeetingAttendees([]);
//       return;
//     }
//     const students = getStudentsBySchool;
//     const firstMeeting = selectedMeetings[0];

//     setAttendees(attendees);

//     setSelectedMeetingAttendees(
//       getAttendeesByMeeting.filter(
//         (a) => a.meeting_id === selectedMeetings[0]?.id
//       )
//     );
//   }, [selectedMeetings]);

//   const getName = (rowData: Meeting) => {
//     const students = getStudentsBySchool;
//     const { data: currentAttendees } =
//       api.attendees.getAttendeesByMeeting.useQuery(rowData.id) as {
//         data: MeetingAttendees[];
//       };

//     if (!currentAttendees) {
//       return <div>Loading...</div>;
//     }
//     // Map attendee ids to student names
//     const names = students.map((currentStudent) => {
//       const attendee = currentAttendees.find(
//         (a) => a.student_id === currentStudent.id
//       );
//       const studentId = attendee?.student_id;
//       const student = getStudentsBySchool.find((s) => s.id === studentId);
//       const firstName = student?.first_name ?? "";
//       const lastName = student?.last_name ?? "";

//       return `${firstName} ${lastName}`;
//     });

//     const filteredNames = names.filter((name) => name != " ");

//     // Join names into string
//     return filteredNames.length > 1
//       ? filteredNames.join(", ")
//       : filteredNames[0];
//   };

//   const getMeetingStatus = (rowData: Meeting) => {
//     const meeting_id = rowData.id;
//     const meetingAttendees = getAttendeesByMeeting.find(
//       (meetingAttendee) => meetingAttendee.meeting_id === meeting_id
//     );
//     const meeting_status = meetingAttendees?.meeting_status;
//     // const status = student?.meeting_status ?? '';
//     return meeting_status;
//   };

//   const getStatusForTable = (meeting_status: string) => {
//     switch (meeting_status) {
//       case "Met":
//         return "primary";

//       case "Student Absent":
//         return "secondary";

//       case "Tutor Absent":
//         return "secondary";

//       case "Student Unavailable":
//         return "secondary";

//       case "Tutor Unavailable":
//         return "secondary";
//     }
//   };

//   const toggleAllCheckboxes = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.checked) {
//       setSelectedMeetings(filteredMeetings);
//     } else {
//       setSelectedMeetings([]);
//     }
//   };

//   const isCheckboxChecked = (meeting: Meeting) => {
//     return selectedMeetings.some(
//       (selectedMeeting) => selectedMeeting.id === meeting.id
//     );
//   };

//   const toggleCheckbox = (meeting: Meeting) => {
//     // If checked, remove
//     if (isCheckboxChecked(meeting)) {
//       setSelectedMeetings(selectedMeetings.filter((m) => m.id !== meeting.id));
//       return;
//     }
//     // Else select only this one
//     setSelectedMeetings([meeting]);
//     const students = getStudentsBySchool;
//     const attendees = getAttendeesByMeeting;
//     const firstMeeting = selectedMeetings[0];
//     setSelectedMeetingAttendees(
//       getAttendeesByMeeting.filter(
//         (a) => a.meeting_id === selectedMeetings[0]?.id
//       )
//     );
//   };

//   // const toggleCheckbox = (meeting: Meeting) => {
//   //   let updatedMeetings: Meeting[];

//   //   if (isCheckboxChecked(meeting)) {
//   //     updatedMeetings = selectedMeetings.filter(
//   //       (m) => m.meeting_id !== meeting.meeting_id
//   //     );
//   //   } else {
//   //     updatedMeetings = [...selectedMeetings, meeting];
//   //   }

//   //   if (updatedMeetings.length > 0) {
//   //     setSelectedMeetings(updatedMeetings);
//   //   } else {
//   //     setSelectedMeetings([]);
//   //   }
//   // };
//   //
//   // const toggleCheckbox = (meeting: Meeting) => {
//   //   setSelectedMeetings((prevSelectedMeetings: Meeting[]): Meeting[] => {
//   //     if (isCheckboxChecked(meeting)) {
//   //       return prevSelectedMeetings.filter(
//   //         (selectedMeeting) => selectedMeeting.meeting_id !== meeting.meeting_id
//   //       );
//   //     } else {
//   //       return [...prevSelectedMeetings, meeting];
//   //     }
//   //   });
//   // };

//   return (
//     <Card className="lg:w-7 flex-order-1 lg:flex-order-2 elevate-item">
//       {/* <ul>
//         {getAttendeesByMeeting.map((getAttendeesByMeeting) => {
//           const { data: student } = getAttendeesByMeeting(
//             studentId
//           );

//           return (
//             <li key={getAttendeesByMeeting.id}>
//               {student.firstName} {student.lastName}
//             </li>
//           );
//         })}
//       </ul> */}
//       <div className="meeting-list-name-select flex justify-content-between align-items-center gap-4">
//         <h3>Meetings</h3>
//         {/* <MeetingListNameSelect
//           selectedNames={selectedNames}
//           onNameSelect={handleNameSelect}
//         /> */}
//       </div>
//       <DataTable
//         value={filteredMeetings}
//         rowGroupMode="subheader"
//         groupRowsBy="dateString"
//         sortMode="single"
//         sortField="start"
//         sortOrder={1}
//         scrollable
//         scrollHeight="510px"
//         rowGroupHeaderTemplate={headerTemplate}
//         rowGroupFooterTemplate={footerTemplate}
//         dataKey="id"
//         stripedRows
//         tableStyle={{ minWidth: "20rem" }}
//         rowClassName={(rowData: Meeting) =>
//           isCheckboxChecked(rowData) ? "row-selected" : ""
//         }
//       >
//         <Column
//           header={() => (
//             <Checkbox
//               indeterminate={
//                 selectedMeetings.length > 0 &&
//                 selectedMeetings.length < filteredMeetings.length
//               }
//               checked={
//                 selectedMeetings.length === filteredMeetings.length &&
//                 filteredMeetings.length > 0
//               }
//               onChange={toggleAllCheckboxes}
//             />
//           )}
//           body={(rowData: Meeting) => (
//             <Checkbox
//               checked={isCheckboxChecked(rowData)}
//               onChange={() => toggleCheckbox(rowData)}
//             />
//           )}
//           style={{ width: "3rem" }}
//           headerStyle={{ width: "3rem" }}
//         />
//         <Column
//           field="time"
//           header="Time"
//           body={formatMeetingTime}
//           style={{ minWidth: "170px", maxWidth: "calc(170px + 1.5rem)" }}
//           sortable
//         />
//         <Column
//           body={getName}
//           header="Name"
//           style={{ minWidth: "150px" }}
//           sortable
//         />
//         <Column
//           field="meeting_status"
//           header="Meeting Status"
//           body={statusBodyTemplate}
//           style={{ minWidth: "130px", maxWidth: "180px" }}
//           className="meeting-status"
//           sortable
//         />
//       </DataTable>
//     </Card>
//   );
// };

// export default MeetingList;
