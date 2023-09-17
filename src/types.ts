import { type JsonValue } from '@prisma/client/runtime/library';

export interface Student {
  id: number;
  school?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  home_room_teacher?: string | null;
  tutor_ln?: string | null;
  tutor_fn?: string | null;
  intervention_program?: string | null;
  level_lesson?: string | null;
  date_intervention_began?: Date | null;
  services?: string | null;
  new_student?: boolean | null;
  moved?: boolean | null;
  new_location?: string | null;
  withdrew?: boolean | null;
  additional_comments?: string | null;
  last_edited?: Date | null;
  created_at?: Date | null;
  schedule?: JsonValue | null;
}
