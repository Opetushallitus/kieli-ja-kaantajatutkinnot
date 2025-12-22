import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel } from 'enums/app';

export interface ClerkRegistration {
  examDate: Dayjs;
}

export interface ClerkExamSessionResponse {
  language: ExamLanguage;
  level: ExamLevel;
  registrations: Array<ClerkRegistration>;
}

export interface ClerkExamSession {
  language: ExamLanguage;
  level: ExamLevel;
  registrations: Array<ClerkRegistration>;
}
