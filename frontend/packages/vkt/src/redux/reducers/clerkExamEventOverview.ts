import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamEvent } from 'interfaces/clerkExamEvent';

interface ClerkExamEventOverviewState {
  overviewStatus: APIResponseStatus;
  examEventDetailsStatus: APIResponseStatus;
  examEvent?: ClerkExamEvent;
}

const initialState: ClerkExamEventOverviewState = {
  overviewStatus: APIResponseStatus.NotStarted,
  examEventDetailsStatus: APIResponseStatus.NotStarted,
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
} = clerkExamEventOverviewSlice.actions;
