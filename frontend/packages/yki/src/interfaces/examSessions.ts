import { Dayjs } from 'dayjs';
import { WithId } from 'shared/src/interfaces/with';

import { OrganizerContact } from 'interfaces/organizer';

export interface ExamSessionsResponse {
  exam_sessions: Array<ExamSessionResponse>;
}

export interface ExamSessions {
  exam_sessions: Array<ExamSession>;
}

interface ExamSessionResponse
  extends Omit<
    ExamSession,
    | 'session_date'
    | 'post_admission_start_date'
    | 'post_admission_end_date'
    | 'registration_start_date'
    | 'registration_end_date'
  > {
  session_date: string;
  post_admission_start_date?: string;
  post_admission_end_date?: string;
  registration_start_date?: string;
  registration_end_date?: string;
}

interface ExamSessionLocation {
  name: string;
  post_office: string;
  zip: string;
  street_address: string;
  other_location_info: string;
  extra_information: string;
  lang: 'fi' | 'sv' | 'en';
}

export interface ExamSession extends WithId {
  session_date: Dayjs;
  language_code: string;
  level_code: string;
  max_participants: number;
  published_at: string;
  location: Array<ExamSessionLocation>;
  office_oid?: string;
  organizer_oid?: string;
  exam_fee?: string;
  contact?: Array<OrganizerContact>;
  open?: boolean;
  queue?: number;
  queue_full?: boolean;
  participants?: number;
  post_admission_quota?: number;
  post_admission_start_date?: Dayjs;
  post_admission_end_date?: Dayjs;
  post_admission_active?: boolean;
  registration_start_date?: Dayjs;
  registration_end_date?: Dayjs;
}