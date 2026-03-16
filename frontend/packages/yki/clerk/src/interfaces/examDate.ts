import { Dayjs } from 'dayjs';

interface ExamDateLanguage {
  id: number;
  languageCode: string;
  levelCode: string;
}

export interface ExamDate {
  id: number;
  examDate: Dayjs;
  languages: ExamDateLanguage[];
}

export interface ExamDateResponse {
  id: number;
  examDate: string;
  languages: ExamDateLanguage[];
}

interface LanguageLevelSelection {
  languageCode: string;
  levelCode: string;
}

export interface CreateExamDateRequest {
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  languages: LanguageLevelSelection[];
  examTypes: string[];
}
