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
    setSelectedPublicExamEvent(state, action: PayloadAction<PublicExamEvent>) {
      if (
        !state.selectedExamEvent ||
        state.selectedExamEvent.id !== action.payload.id
      ) {
        state.selectedExamEvent = action.payload;
      } else {
        state.selectedExamEvent = undefined;
      }
    },
  },
});

export const publicExamEventReducer = publicExamEventSlice.reducer;
export const {
  loadPublicExamEvents,
  rejectPublicExamEvents,
  storePublicExamEvents,
  setPublicExamEventLanguageFilter,
  setSelectedPublicExamEvent,
} = publicExamEventSlice.actions;
