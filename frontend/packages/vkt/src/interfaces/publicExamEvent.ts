import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';

export interface PublicExamEvent extends WithId {
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  date: Dayjs;
  registrationCloses: Dayjs;
  openings: number;
  hasCongestion: boolean;
}

export interface PublicExamEventResponse
  extends Omit<PublicExamEvent, 'date' | 'registrationCloses'> {
  date: string;
  registrationCloses: string;
}
