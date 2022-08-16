import { Dayjs } from 'dayjs';

import { ExaminationDateStatus } from 'enums/examinationDate';
import { WithId, WithVersion } from 'interfaces/with';

export interface ExaminationDate extends Omit<ExaminationDateResponse, 'date'> {
  date: Dayjs;
}
export interface ExaminationDateResponse extends WithId, WithVersion {
  date: string;
}

export interface ExaminationDateFilter {
  examinationDateStatus: ExaminationDateStatus;
}
