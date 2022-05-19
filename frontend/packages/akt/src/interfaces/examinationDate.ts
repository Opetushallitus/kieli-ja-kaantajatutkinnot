import { Dayjs } from 'dayjs';
import { Action } from 'redux';
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

export interface ExaminationDateAction
  extends Action<string>,
    Partial<ExaminationDates> {
  filter?: ExaminationDateFilter;
  examinationDateId?: number;
  status?: APIResponseStatus;
  date?: Dayjs;
}

export interface RemoveExaminationDateAction extends Action<string> {
  examinationDateId: number;
}

export interface AddExaminationDateAction extends Action<string> {
  date: Dayjs;
}
