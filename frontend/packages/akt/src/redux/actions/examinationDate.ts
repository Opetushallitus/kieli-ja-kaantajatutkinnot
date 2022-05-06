import { Dayjs } from 'dayjs';

import { ExaminationDateFilter } from 'interfaces/examinationDate';
import {
  EXAMINATION_DATE_ADD,
  EXAMINATION_DATE_ADD_FILTER,
  EXAMINATION_DATE_LOAD,
  EXAMINATION_DATE_REMOVE,
} from 'redux/actionTypes/examinationDate';

export const setExaminationDateFilter = (filter: ExaminationDateFilter) => ({
  type: EXAMINATION_DATE_ADD_FILTER,
  filter,
});

export const addExaminationDate = (date: Dayjs) => ({
  type: EXAMINATION_DATE_ADD,
  date,
});

export const removeExaminationDate = (examinationDateId: number) => ({
  type: EXAMINATION_DATE_REMOVE,
  examinationDateId,
});

export const loadExaminationDates = {
  type: EXAMINATION_DATE_LOAD,
};
