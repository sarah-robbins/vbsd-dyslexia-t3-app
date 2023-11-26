import { useEffect, useState } from 'react';
import type { Meeting, MeetingAttendees } from './types';
import { api } from './utils/api';

const useCurrentAttendees = (selectedMeetings: Meeting[]) => {
  const [currentAttendees, setCurrentAttendees] = useState<MeetingAttendees[]>(
    []
  );

  useEffect(() => {
    if (selectedMeetings.length > 0) {
      const selectedMeeting: Meeting = selectedMeetings[0] ?? ({} as Meeting);
      const { data: getCurrentAttendees } =
        api.attendees.getAttendeesByMeeting.useQuery(selectedMeeting.id) as {
          data: MeetingAttendees[];
        };
      console.log('currentAttendees: ', currentAttendees);
      setCurrentAttendees(getCurrentAttendees);
    }
  }, [currentAttendees, selectedMeetings]);

  console.log('CURRENT ATTENDEES FROM THE HOOK: ', currentAttendees);
};

export default useCurrentAttendees;
