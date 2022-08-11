import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationDateStatus } from 'enums/examinationDate';
import { WithId, WithVersion } from 'interfaces/with';

export interface ExaminationDate extends Omit<ExaminationDateResponse, 'date'> {
  date: Dayjs;
}
export interface ExaminationDateResponse extends WithId, WithVersion {
  date: string;
}

export interface ExaminationDates {
  dates: Array<ExaminationDate>;
}

export interface ExaminationDateFilter {
  examinationDateStatus: ExaminationDateStatus;
}

export interface ExaminationDatesState extends ExaminationDates {
  status: APIResponseStatus;
}

export interface AddExaminationDateState {
  status: APIResponseStatus;
  date: Dayjs;
}

export interface RemoveExaminationDateState {
  status: APIResponseStatus;
  examinationDateId: number | undefined;
}

export interface ExaminationDateState {
  examinationDates: ExaminationDatesState;
  addExaminationDate: AddExaminationDateState;
  removeExaminationDate: RemoveExaminationDateState;
  filter: ExaminationDateFilter;
}
