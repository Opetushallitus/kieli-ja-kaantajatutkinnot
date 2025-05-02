import { Dayjs } from "dayjs";
import { WithId } from "shared/interfaces";

import { ExamLanguage, ExamLevel } from "enums/app";

interface PersonRegistrations extends WithId {
  examSessionId: string;
  examLang: ExamLanguage;
  examLevel: ExamLevel;
  zip: string;
  postOffice: string;
  examDate: Dayjs;
  streetAddress: string;
  isTransferable: boolean;
}

interface PersonRegistrationsResponse extends WithId {
  exam_session_id: string;
  language_code: string;
  level_code: string;
  zip: string;
  post_office: string;
  exam_date: string;
  street_address: string;
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
