import { Dayjs } from 'dayjs';

export interface ExamDateLanguage {
  id: number;
  languageCode: string;
  levelCode: string;
}

export type ExamType = 'FULL' | 'READ_SPEAK' | 'LISTEN_WRITE';

export type ExamDate = {
  id: number;
  examDate: Dayjs;
  registrationStartDate: Dayjs;
  registrationEndDate: Dayjs;
  examType: ExamType;
  languages: ExamDateLanguage[];
};

export interface ExamDateResponse {
  id: number;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examType: ExamType;
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
  examType: ExamType;
}
