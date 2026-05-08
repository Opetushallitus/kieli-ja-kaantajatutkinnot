import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel, RegistrationKind } from 'enums/app';
import { OrganizerContact } from 'interfaces/organizer';

export interface ExamSessionsResponse {
  exam_sessions: Array<ExamSessionResponse>;
}

export interface ExamSessionFilters {
  language?: ExamLanguage;
  level?: ExamLevel;
  municipality?: string;
  excludeFullSessions: boolean;
  excludeNonOpenSessions: boolean;
  selectedPartialExamTypes: Array<
    'ALL_PARTS' | 'READ' | 'SPEAK' | 'LISTEN' | 'WRITE'
  >;
}

export interface ExamSessions {
  exam_sessions: Array<ExamSession>;
}

export interface ExamSessionResponse
  extends Omit<
    ExamSession,
    'session_date' | 'registration_start_date' | 'registration_end_date'
  > {
  session_date: string;
  registration_start_date?: string;
  registration_end_date?: string;
}

export interface ExamSessionLocation {
  name: string;
  post_office: string;
  zip: string;
  street_address: string;
  other_location_info: string;
  extra_information?: string;
  lang: 'fi' | 'sv' | 'en';
}

type WithIdType = { id: number };

export type ExamSessionType = 'FULL' | 'READ_SPEAK' | 'LISTEN_WRITE';

export type ExamSession = WithIdType & {
  type: ExamSessionType;
  session_date: Dayjs;
  language_code: ExamLanguage;
  level_code: ExamLevel;
  start_time?: string;
  start_time_read_listen?: string;
  start_time_speak_write?: string;
  max_participants: number;
  max_participants_read_listen?: number;
  max_participants_speak_write?: number;
  participants: number;
  participants_read_listen?: number;
  participants_speak_write?: number;
  published_at: string;
  location: Array<ExamSessionLocation>;
  exam_fee: number;
  available_registration_kind: RegistrationKind;
  office_oid?: string;
  organizer_oid?: string;
  contact?: Array<OrganizerContact>;
  open?: boolean;
  queue?: number;
  queue_full?: boolean;
  registration_start_date: Dayjs;
  registration_end_date: Dayjs;
  upcoming_admission?: boolean;
};
