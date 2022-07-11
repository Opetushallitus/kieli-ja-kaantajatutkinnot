import dayjs from 'dayjs';
import { Reducer } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { ExaminationDateStatus } from 'enums/examinationDate';
import {
  ExaminationDate,
  ExaminationDateAction,
  ExaminationDateFilter,
  ExaminationDateState,
} from 'interfaces/examinationDate';
import {
  EXAMINATION_DATE_ADD_FILTER,
  EXAMINATION_DATE_ERROR,
  EXAMINATION_DATE_LOAD,
  EXAMINATION_DATE_RECEIVED,
} from 'redux/actionTypes/examinationDate';

const defaultState = {
  examinationDates: {
    status: APIResponseStatus.NotStarted,
    dates: [],
  },
  addExaminationDate: {
    status: APIResponseStatus.NotStarted,
    date: dayjs(),
  },
  removeExaminationDate: {
    status: APIResponseStatus.NotStarted,
    examinationDateId: undefined,
  },
  filter: { examinationDateStatus: ExaminationDateStatus.Upcoming },
};

export const examinationDateReducer: Reducer<
  ExaminationDateState,
  ExaminationDateAction
> = (state = defaultState, action) => {
  switch (action.type) {
    // Fetch examination dates
    case EXAMINATION_DATE_LOAD:
      return {
        ...state,
        examinationDates: {
          ...state.examinationDates,
          status: APIResponseStatus.InProgress,
        },
      };
    case EXAMINATION_DATE_RECEIVED:
      return {
        ...state,
        examinationDates: {
          dates: action.dates as Array<ExaminationDate>,
          status: APIResponseStatus.Success,
        },
      };
    case EXAMINATION_DATE_ERROR:
      return {
        ...state,
        examinationDates: {
          ...state.examinationDates,
          status: APIResponseStatus.Error,
        },
      };

    // Toggle filters
    case EXAMINATION_DATE_ADD_FILTER:
      return { ...state, filter: action.filter as ExaminationDateFilter };
  }

  return state;
};
