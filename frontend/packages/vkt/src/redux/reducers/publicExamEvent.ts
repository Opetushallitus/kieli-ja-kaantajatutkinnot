import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

interface PublicExamEventState {
  status: APIResponseStatus;
  examEvents: Array<PublicExamEvent>;
  languageFilter: ExamLanguage;
}

const initialState: PublicExamEventState = {
  status: APIResponseStatus.NotStarted,
  examEvents: [],
  languageFilter: ExamLanguage.ALL,
};

const publicExamEventSlice = createSlice({
  name: 'publicExamEvent',
  initialState,
  reducers: {
    loadPublicExamEvents(state) {
      state.status = APIResponseStatus.InProgress;
    },
    refreshPublicExamEvents() {},
    rejectPublicExamEvents(state) {
      state.status = APIResponseStatus.Error;
    },
    resetPublicExamEventSelections(state) {
      state.languageFilter = initialState.languageFilter;
    },
    storePublicExamEvents(
      state,
      action: PayloadAction<Array<PublicExamEvent>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.examEvents = action.payload;
    },
    setPublicExamEventLanguageFilter(
      state,
      action: PayloadAction<ExamLanguage>,
    ) {
      state.languageFilter = action.payload;
    },
  },
});

export const publicExamEventReducer = publicExamEventSlice.reducer;
export const {
  loadPublicExamEvents,
  refreshPublicExamEvents,
  rejectPublicExamEvents,
  resetPublicExamEventSelections,
  storePublicExamEvents,
  setPublicExamEventLanguageFilter,
} = publicExamEventSlice.actions;
