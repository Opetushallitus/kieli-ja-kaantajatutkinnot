import {
  ExamLanguage,
  ExamLevel,
} from 'enums/app';

export interface ClerkRegistration {

}

export interface ClerkExamSessionDetails {
  language: ExamLanguage;
  level: ExamLevel;
  registrations: Array<ClerkRegistration>;
}
