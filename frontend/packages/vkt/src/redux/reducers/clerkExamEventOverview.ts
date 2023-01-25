import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentStatusChange } from 'interfaces/clerkEnrollment';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkExamEventOverviewState {
  overviewStatus: APIResponseStatus;
  examEventDetailsStatus: APIResponseStatus;
  clerkEnrollmentChangeStatus: APIResponseStatus;
  examEvent?: ClerkExamEvent;
}

const initialState: ClerkExamEventOverviewState = {
  overviewStatus: APIResponseStatus.NotStarted,
  examEventDetailsStatus: APIResponseStatus.NotStarted,
  clerkEnrollmentChangeStatus: APIResponseStatus.NotStarted,
  examEvent: undefined,
};

const clerkExamEventOverviewSlice = createSlice({
  name: 'clerkExamEventOverview',
  initialState,
  reducers: {
    loadClerkExamEventOverview(state, _action: PayloadAction<number>) {
      state.overviewStatus = APIResponseStatus.InProgress;
    },
    rejectClerkExamEventOverview(state) {
      state.overviewStatus = APIResponseStatus.Error;
    },
    resetClerkExamEventOverview(state) {
      state.overviewStatus = initialState.overviewStatus;
      state.examEventDetailsStatus = initialState.examEventDetailsStatus;
      state.examEvent = initialState.examEvent;
    },
    storeClerkExamEventOverview(state, action: PayloadAction<ClerkExamEvent>) {
      state.overviewStatus = APIResponseStatus.Success;
      state.examEvent = action.payload;
    },
    updateClerkExamEventDetails(state, _action: PayloadAction<ClerkExamEvent>) {
      state.examEventDetailsStatus = APIResponseStatus.InProgress;
    },
    updatingClerkExamEventDetailsSucceeded(
      state,
      action: PayloadAction<ClerkExamEvent>
    ) {
      state.overviewStatus = APIResponseStatus.Success;
      state.examEventDetailsStatus = APIResponseStatus.Success;
      state.examEvent = action.payload;
    },
    rejectClerkExamEventDetailsUpdate(state) {
      state.examEventDetailsStatus = APIResponseStatus.Error;
    },
    resetClerkExamEventDetailsUpdate(state) {
      state.examEventDetailsStatus = initialState.examEventDetailsStatus;
    },
    changeClerkEnrollmentStatus(
      state,
      _action: PayloadAction<{
        statusChange: ClerkEnrollmentStatusChange;
        examEvent: ClerkExamEvent;
      }>
    ) {
      state.clerkEnrollmentChangeStatus = APIResponseStatus.InProgress;
    },
    changingClerkEnrollmentStatusSucceeded(state) {
      state.clerkEnrollmentChangeStatus = APIResponseStatus.Success;
    },
    rejectClerkEnrollmentStatusChange(state) {
      state.clerkEnrollmentChangeStatus = APIResponseStatus.Error;
    },
    resetClerkEnrollmentStatusChange(state) {
      state.clerkEnrollmentChangeStatus =
        initialState.clerkEnrollmentChangeStatus;
    },
  },
});

export const clerkExamEventOverviewReducer =
  clerkExamEventOverviewSlice.reducer;
export const {
  loadClerkExamEventOverview,
  rejectClerkExamEventOverview,
  resetClerkExamEventOverview,
  storeClerkExamEventOverview,
  updateClerkExamEventDetails,
  updatingClerkExamEventDetailsSucceeded,
  rejectClerkExamEventDetailsUpdate,
  resetClerkExamEventDetailsUpdate,
  changeClerkEnrollmentStatus,
  changingClerkEnrollmentStatusSucceeded,
  rejectClerkEnrollmentStatusChange,
  resetClerkEnrollmentStatusChange,
} = clerkExamEventOverviewSlice.actions;
