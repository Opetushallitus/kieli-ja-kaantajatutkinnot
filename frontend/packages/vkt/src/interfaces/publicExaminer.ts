import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';

interface PublicMunicipality {
  fi: string;
  sv: string;
}

export interface PublicExaminer extends WithId {
  name: string;
  language: ExamLanguage;
  municipalities: Array<PublicMunicipality>;
  examDates: Array<Dayjs>;
}

export interface PublicExaminerResponse extends WithId {
  lastName: string;
  firstName: string;
  languages: Array<ExamLanguage>;
  municipalities: Array<PublicMunicipality>;
  examDates: Array<string>;
}

export interface PublicExaminerState {
  status: APIResponseStatus;
  examiners: Array<PublicExaminer>;
  languageFilter: ExamLanguage;
}
