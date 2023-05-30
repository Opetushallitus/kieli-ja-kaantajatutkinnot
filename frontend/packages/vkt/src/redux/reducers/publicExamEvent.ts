import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

interface PublicExamEventState {
  status: APIResponseStatus;
  examEvents: Array<PublicExamEvent>;
  selectedExamEvent?: PublicExamEvent;
  languageFilter: ExamLanguage;
}

const initialState: PublicExamEventState = {
  status: APIResponseStatus.NotStarted,
  examEvents: [],
  selectedExamEvent: undefined,
  languageFilter: ExamLanguage.ALL,
};

const publicExamEventSlice = createSlice({
  name: 'publicExamEvent',
  initialState,
  reducers: {
    loadPublicExamEvents(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicExamEvents(state) {
      state.status = APIResponseStatus.Error;
    },
    resetPublicExamEventSelections(state) {
      state.selectedExamEvent = initialState.selectedExamEvent;
      state.languageFilter = initialState.languageFilter;
    },
    storePublicExamEvents(
      state,
      action: PayloadAction<Array<PublicExamEvent>>
    ) {
      state.status = APIResponseStatus.Success;
      state.examEvents = action.payload;
    },
    setPublicExamEventLanguageFilter(
      state,
      action: PayloadAction<ExamLanguage>
    ) {
      state.languageFilter = action.payload;
    },
    resetSelectedPublicExamEvent(state) {
      state.selectedExamEvent = undefined;
    },
  },
});

export const publicExamEventReducer = publicExamEventSlice.reducer;
export const {
  loadPublicExamEvents,
  rejectPublicExamEvents,
  resetPublicExamEventSelections,
  storePublicExamEvents,
  setPublicExamEventLanguageFilter,
  resetSelectedPublicExamEvent,
} = publicExamEventSlice.actions;
