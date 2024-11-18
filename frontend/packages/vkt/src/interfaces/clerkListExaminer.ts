import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { ExaminerDetails } from 'interfaces/examinerDetails';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';

export interface ClerkListExaminerFilters {
  examLanguage: ExamLanguage;
}

export interface ClerkListExaminerExamEventFilters {
  examLanguage: ExamLanguage;
  toggleFilters: ExamEventToggleFilter;
}

export interface ClerkListExaminerState {
  status: APIResponseStatus;
  examiners: Array<ExaminerDetails>;
  filters: {
    examiners: ClerkListExaminerFilters
    examEvents: ClerkListExaminerExamEventFilters;
  }
}

export interface ClerkExaminerExamEventListingEntry extends WithId {
  examiner: Omit<ExaminerDetails, 'examEvents' | 'contactRequests'>;
  examEvent: ExaminerExamEvent;
}