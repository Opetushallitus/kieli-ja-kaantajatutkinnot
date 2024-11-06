import { APIResponseStatus } from 'shared/enums';

import { ExaminerDetails } from 'interfaces/examinerDetails';

export interface ClerkListExaminerState {
  status: APIResponseStatus;
  examiners: Array<ExaminerDetails>;
}
