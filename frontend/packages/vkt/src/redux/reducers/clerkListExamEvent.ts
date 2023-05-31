import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  EnrollmentStatus,
  ExamEventToggleFilter,
  ExamLanguage,
} from 'enums/app';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';
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
    resetClerkListExamEvent(state) {
      state.status = initialState.status;
      state.examEvents = initialState.examEvents;
      state.languageFilter = initialState.languageFilter;
      state.toggleFilter = initialState.toggleFilter;
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
    upsertExamEvents(state, action: PayloadAction<ClerkExamEvent>) {
      const participants = action.payload.enrollments.filter((enrollment) =>
        [
          EnrollmentStatus.PAID,
          EnrollmentStatus.EXPECTING_PAYMENT,
          EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
        ].includes(enrollment.status)
      ).length;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { version, enrollments, ...rest } = action.payload;
      const examEvent = {
        ...rest,
        participants,
      };

      const examEvents = [...state.examEvents];
      const idx = examEvents.findIndex(
        (e: ClerkListExamEvent) => e.id === examEvent.id
      );
      const spliceIndex = idx >= 0 ? idx : examEvents.length;

      examEvents.splice(spliceIndex, 1, examEvent);
      state.examEvents = examEvents;
    },
  },
});

export const clerkListExamEventReducer = clerkListExamEventSlice.reducer;
export const {
  loadExamEvents,
  rejectExamEvents,
  storeExamEvents,
  resetClerkListExamEvent,
  setExamEventLanguageFilter,
  setExamEventToggleFilter,
  upsertExamEvents,
} = clerkListExamEventSlice.actions;
