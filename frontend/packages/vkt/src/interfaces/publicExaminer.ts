import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';
import { APIResponseStatus } from 'shared/enums';

export interface PublicExaminer extends WithId {
  name: string;
  language: ExamLanguage;
  // TODO Municipality could instead be something like { fi: 'Helsinki', sv: 'Helsingfors' } ?
  municipalities: Array<string>;
  examDates: Array<Dayjs>;
}

export interface PublicExaminerState {
  status: APIResponseStatus;
  examiners: Array<PublicExaminer>;
  languageFilter: ExamLanguage;
}
