import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';

interface PublicMunicipality {
  fi: string;
  sv: string;
}

interface PublicExaminerExamDate {
  examDate: Dayjs;
  isFull: boolean;
}

interface PublicExaminerExamDateResponse extends Omit<PublicExaminerExamDate, 'examDate'> {
  examDate: string;
}

export interface PublicExaminer extends WithId {
  name: string;
  language: ExamLanguage;
  municipalities: Array<PublicMunicipality>;
  examDates: Array<PublicExaminerExamDate>;
}

export interface PublicExaminerResponse extends WithId {
  lastName: string;
  firstName: string;
  languages: Array<ExamLanguage>;
  municipalities: Array<PublicMunicipality>;
  examDates: Array<PublicExaminerExamDateResponse>;
}

export interface PublicExaminerState {
  status: APIResponseStatus;
  examiners: Array<PublicExaminer>;
  languageFilter: ExamLanguage;
}
