import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';

export interface ExaminerExamEventOverviewState {
  overviewStatus: APIResponseStatus;
  examEvent?: ExaminerExamEvent;
}

const initialState: ExaminerExamEventOverviewState = {
  overviewStatus: APIResponseStatus.NotStarted,
  examEvent: undefined,
};

const examinerExamEventOverviewSlice = createSlice({
  name: 'examinerExamEventOverview',
  initialState,
  reducers: {
    loadExaminerExamEventOverview(
      state,
      _action: PayloadAction<{
        oid: string;
        examEventId: number;
      }>,
    ) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    resetExaminerExamEventOverview(_) {
      return initialState;
    },
    storeExaminerExamEventOverview(
      state,
      action: PayloadAction<ExaminerExamEvent>,
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.examEvent = action.payload;
    },
    rejectExaminerExamEventOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
  },
});

export const examinerExamEventOverviewReducer =
  examinerExamEventOverviewSlice.reducer;
export const {
  loadExaminerExamEventOverview,
  storeExaminerExamEventOverview,
  rejectExaminerExamEventOverview,
  resetExaminerExamEventOverview,
} = examinerExamEventOverviewSlice.actions;
