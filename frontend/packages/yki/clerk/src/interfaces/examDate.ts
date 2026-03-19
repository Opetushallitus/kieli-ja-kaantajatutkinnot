import { Dayjs } from 'dayjs';

export interface ExamDateLanguage {
  id: number;
  languageCode: string;
  levelCode: string;
}

export type ExamDate = {
  id: number;
  examDate: Dayjs;
  registrationStartDate: Dayjs;
  registrationEndDate: Dayjs;
  examType: string;
  languages: ExamDateLanguage[];
};

export interface ExamDateResponse {
  id: number;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examType: string;
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
  examType: string;
}
