import { Dayjs } from 'dayjs';

export interface ExamDateLanguage {
  id: number;
  languageCode: string;
  levelCode: string;
  evaluationStartDate: string | null;
  evaluationEndDate: string | null;
}

export type ExamType = 'FULL' | 'READ_SPEAK' | 'LISTEN_WRITE';

export type ExamDate = {
  id: number;
  examDate: Dayjs;
  registrationStartDate: Dayjs;
  registrationEndDate: Dayjs;
  examType: ExamType;
  languages: ExamDateLanguage[];
  examSessionCount: number;
};

export interface ExamDateResponse {
  id: number;
  examDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  examType: ExamType;
  languages: ExamDateLanguage[];
  examSessionCount: number;
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

export interface UpdateExamDateRequest extends CreateExamDateRequest {
  id: number;
}

export interface LanguageEvaluationOverride {
  examDateLanguageId: number;
  evaluationStartDate: string;
  evaluationEndDate: string;
}

export interface CreateEvaluationRequest {
  evaluationStartDate: string;
  evaluationEndDate: string;
  overrides?: LanguageEvaluationOverride[];
}

export type SortOrder = 'asc' | 'desc' | '';
export type ExamDateSort = `${keyof ExamDate}:${SortOrder}`;
