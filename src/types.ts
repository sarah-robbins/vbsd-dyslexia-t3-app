import { type JsonValue } from '@prisma/client/runtime/library';
import { type Dayjs } from 'dayjs';

export type Student = {
  id?: number;
  school?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  home_room_teacher?: string | null;
  tutor_id?: number | null;
  intervention_program?: string | null;
  level_lesson?: string | null;
  date_intervention_began?: Dayjs | null;
  services?: string | null;
  new_student?: boolean | null;
  moved?: boolean | null;
  new_location?: string | null;
  withdrew?: boolean | null;
  additional_comments?: string | null;
  last_edited?: Dayjs | null;
  created_at?: Dayjs | null;
  schedule?: JsonValue | null;
};

export type FormValues = {
  id?: number;
  student_id?: number;
  meeeting_id?: number;
  name?: string[] | string | null;
  start?: Dayjs | null;
  end?: Dayjs | null;
  meeting_status: string | null;
  program?: string | null;
  level_lesson?: string | null;
  meeting_notes?: string | null;
  edited_by?: string | null;
  edited_on?: Dayjs | null;
  recorded_by?: string | null;
  recorded_on?: Dayjs | null;
};

export type Meeting = {
  id: number;
  start: Date | Dayjs | null;
  end: Date | Dayjs | null;
  program?: string | null;
  level_lesson?: string | null;
  meeting_notes?: string | null;
  edited_by?: string | null;
  edited_on?: Dayjs | null;
  recorded_by?: string | null;
  recorded_on?: Dayjs | null;
  MeetingAttendees?: MeetingAttendees[] | null;
};

export type MeetingAttendees = {
  meeting_id: number;
  student_id: number;
  meeting_status: string | null;
  created_at: Dayjs | null;
  name: string;
  id: number;
};

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  school: string;
  email: string;
  phone: string;
  role: string;
  super_admin_role: string | null;
  picture: string | null;
  created_at: Date;
  view: string;
};

export interface MeetingWithAttendees extends Meeting {
  attendees: {
    id: number;
    meeting_id: number;
    student_id: number;
    meeting_status: string | null;
    created_at: Dayjs | null;
    name: string;
  }[];
}
