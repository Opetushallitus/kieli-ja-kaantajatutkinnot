import { Dayjs } from 'dayjs';

interface ExamDateLanguage {
  id: number;
  languageCode: string;
  levelCode: string;
}

export type ExamDate = {
  id: number;
  examDate: Dayjs;
  registrationStartDate: Dayjs;
  registrationEndDate: Dayjs;
  examTypes: string[];
  languages: ExamDateLanguage[];
};

export interface ExamDateResponse {
  id: number;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examTypes: string[];
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
