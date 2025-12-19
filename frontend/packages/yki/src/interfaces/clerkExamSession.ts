import { ExamLanguage, ExamLevel } from 'enums/app';

export interface ClerkRegistration {}

export interface ClerkExamSession {
  language: ExamLanguage;
  level: ExamLevel;
  registrations: Array<ClerkRegistration>;
}
