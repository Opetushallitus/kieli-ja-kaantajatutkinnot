import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';

export interface ClerkListExaminerFilters {
  examLanguage: ExamLanguage;
}

export interface ClerkListExaminerState {
  status: APIResponseStatus;
  examiners: Array<ExaminerDetails>;
  filters: ClerkListExaminerFilters;
}
