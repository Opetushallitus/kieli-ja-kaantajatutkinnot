
interface ClerkRegistration {

}

export interface ClerkExamSessionDetails {
  language: ExamLanguage;
  level: ExamLevel;
  registrations: Array<Registration>;
}
