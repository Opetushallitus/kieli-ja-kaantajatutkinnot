import { Dayjs } from 'dayjs';

export const EXAMINATION_DATE_ADD = 'EXAMINATION_DATE/ADD';
export const EXAMINATION_DATE_ADD_SUCCESS = 'EXAMINATION_DATE/ADD_SUCCESS';
export const EXAMINATION_DATE_ADD_ERROR = 'EXAMINATION_DATE/ADD_ERROR';

export const EXAMINATION_DATE_REMOVE = 'EXAMINATION_DATE/REMOVE';
export const EXAMINATION_DATE_REMOVE_SUCCESS =
  'EXAMINATION_DATE/REMOVE_SUCCESS';
export const EXAMINATION_DATE_REMOVE_ERROR = 'EXAMINATION_DATE/REMOVE_ERROR';

export const EXAMINATION_DATE_ADD_FILTER = 'EXAMINATION_DATE/ADD_FILTER';

export const EXAMINATION_DATE_LOAD = 'EXAMINATION_DATE/LOAD';
export const EXAMINATION_DATE_LOADING = 'EXAMINATION_DATE/LOADING';
export const EXAMINATION_DATE_ERROR = 'EXAMINATION_DATE/ERROR';
export const EXAMINATION_DATE_RECEIVED = 'EXAMINATION_DATE/RECEIVED';

export type AddExaminationDateActionType = {
  type: typeof EXAMINATION_DATE_ADD;
  date: Dayjs;
};

export type RemoveExaminationDateActionType = {
  type: typeof EXAMINATION_DATE_REMOVE;
  examinationDateId: number;
};
