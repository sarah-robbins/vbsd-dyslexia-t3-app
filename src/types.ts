import { type JsonValue } from '@prisma/client/runtime/library';
import { type Dayjs } from 'dayjs';
import { type Session } from 'next-auth';

export type Student = {
  id?: number;
  student_assigned_id?: string | null;
  school?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  home_room_teacher?: string | null;
  tutor_id?: number | null;
  intervention_program?: string | null;
  level_lesson?: string | null;
  date_intervention_began?: Dayjs | Date | null;
  services?: string | null;
  new_student?: boolean | null;
  graduated?: boolean | null;
  moved?: boolean | null;
  new_location?: string | null;
  withdrew?: boolean | null;
  additional_comments?: string | null;
  last_edited?: Dayjs | Date | null;
  created_at?: Dayjs | Date | null;
  schedule?: JsonValue | null;
  Users?: User;
  MeetingAttendees?: MeetingAttendees[];
  tutorId?: number | null;
  tutorFullName?: string;
  tutorInfo?: {
    value: number | null;
    label: string;
  };
};

export type FormValues = {
  id?: number;
  student_id?: number;
  meeeting_id?: number;
  name?: string[] | string | null;
  start?: Dayjs | null;
  end?: Dayjs | null;
  meeting_status?: string;
  program?: string | null;
  date_intervention_began?: Dayjs | null;
  level_lesson?: string | null;
  meeting_notes?: string | null;
  edited_by?: string | null;
  edited_on?: Dayjs | null;
  recorded_by?: string | null;
  recorded_on?: Dayjs | null;
  moved?: boolean | null;
  withdrew?: boolean | null;
  graduated?: boolean | null;
  new_location?: string | null;
  new_student?: boolean | null;
  additional_comments?: string | null;
  student_assigned_id?: string | null;
  attendees?: MeetingAttendees[];
};

export type Meeting = {
  id?: number;
  start: Date | Dayjs | null;
  end: Date | Dayjs | null;
  program?: string | null;
  level_lesson?: string | null;
  meeting_notes?: string | null;
  edited_by?: string | null;
  edited_on?: Date | Dayjs | null;
  recorded_by?: string | null;
  recorded_on?: Date | Dayjs | null;
  tutor_id?: number | null;
  MeetingAttendees?: MeetingAttendees[];
};

export interface MeetingWithAttendees extends Meeting {
  attendees?: {
    id?: number;
    meeting_id?: number;
    student_id?: number;
    meeting_status?: string;
    created_at?: Dayjs | Date;
    name: string;
    tutor_id?: number | null;
  }[];
}

export type MeetingAttendees = {
  id?: number;
  meeting_id?: number;
  student_id?: number;
  meeting_status?: string;
  created_at?: Date | Dayjs;
  name?: string;
  tutor_id?: number | null;
  Meetings?: Meeting;
};

export type MeetingAttendeesArray = [
  {
    id?: number;
    meeting_id?: number;
    student_id: number;
    meeting_status?: string;
    created_at?: Date | Dayjs;
    name?: string;
    tutor_id?: number | null;
  }
];

export type User = {
  id?: number;
  first_name?: string;
  last_name?: string;
  school?: string | null;
  email?: string;
  phone?: string;
  role?: string | null;
  super_admin_role?: boolean | null;
  picture?: string | null;
  created_at?: Dayjs | Date | null;
  view?: string | null;
};

export type AppSettings = {
  id?: number;
  school_name: string;
  primary_color: string;
  school_options: string[];
  meeting_status_options: string[];
  user_role_options: string[];
  initial_view_options: string[];
  grade_options: string[];
  program_options: string[];
  services_options: string[];
}

export interface customSession  extends Session {
  appSettings: AppSettings;
}
