import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage, ExamLevel, RegistrationStates } from 'enums/app';
import { ExamSessionLocation } from 'interfaces/examSessions';

export interface PersonRegistrations extends WithId {
  state: RegistrationStates;
  examSessionId: string;
  examLang: ExamLanguage;
  examLevel: ExamLevel;
  examDate: Dayjs;
  location: Array<ExamSessionLocation>;
  isTransferable: boolean;
}

interface PersonRegistrationsResponse extends WithId {
  exam_session_id: string;
  language_code: string;
  level_code: string;
  state: string;
  exam_date: string;
  location: Array<ExamSessionLocation>;
  is_transferable: boolean;
}

export interface PersonDetails {
  firstName: string;
  lastName: string;
  email: string;
  registrations: Array<PersonRegistrations>;
}

export interface PersonDetailsResponse {
  first_name: string;
  last_name: string;
  email: string;
  registrations: Array<PersonRegistrationsResponse>;
}
