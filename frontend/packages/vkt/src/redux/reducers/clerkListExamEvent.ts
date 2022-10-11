import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';

interface ClerkListExamEventState {
  status: APIResponseStatus;
  examEvents: Array<ClerkListExamEvent>;
  languageFilter: ExamLanguage;
  toggleFilter: ExamEventToggleFilter;
}

const initialState: ClerkListExamEventState = {
  status: APIResponseStatus.NotStarted,
  examEvents: [],
  languageFilter: ExamLanguage.ALL,
  toggleFilter: ExamEventToggleFilter.Upcoming,
};

const clerkListExamEventSlice = createSlice({
  name: 'clerkListExamEvent',
  initialState,
  reducers: {
    loadExamEvents(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamEvents(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamEvents(state, action: PayloadAction<Array<ClerkListExamEvent>>) {
      state.status = APIResponseStatus.Success;
      state.examEvents = action.payload;
    },
    setExamEventLanguageFilter(state, action: PayloadAction<ExamLanguage>) {
      state.languageFilter = action.payload;
    },
    setExamEventToggleFilter(
      state,
      action: PayloadAction<ExamEventToggleFilter>
    ) {
      state.toggleFilter = action.payload;
    },
  },
});

export const clerkListExamEventReducer = clerkListExamEventSlice.reducer;
export const {
  loadExamEvents,
  rejectExamEvents,
  storeExamEvents,
  setExamEventLanguageFilter,
  setExamEventToggleFilter,
} = clerkListExamEventSlice.actions;
