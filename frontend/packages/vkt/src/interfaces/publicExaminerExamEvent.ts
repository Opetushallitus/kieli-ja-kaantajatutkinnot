import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';
import { PublicExaminer } from 'interfaces/publicExaminer';

export interface PublicExaminerExamEvent extends WithId {
  examiner: PublicExaminer;
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  date: Dayjs;
  location: string;
  registrationCloses: Dayjs;
  openings: number;
}

export interface PublicExaminerExamEventResponse
  extends Omit<PublicExaminerExamEvent, 'date' | 'registrationCloses'> {
  date: string;
  registrationCloses: string;
}
