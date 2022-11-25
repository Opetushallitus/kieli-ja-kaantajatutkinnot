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
    resetClerkExamEventOverview(_state) {
      return initialState;
    },
    resetClerkExamEventDetailsUpdate(state) {
      state.examEventDetailsStatus = initialState.examEventDetailsStatus;
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
  },
});

export const clerkExamEventOverviewReducer =
  clerkExamEventOverviewSlice.reducer;
export const {
  loadClerkExamEventOverview,
  rejectClerkExamEventOverview,
  resetClerkExamEventOverview,
  resetClerkExamEventDetailsUpdate,
  storeClerkExamEventOverview,
  updateClerkExamEventDetails,
  updatingClerkExamEventDetailsSucceeded,
  rejectClerkExamEventDetailsUpdate,
} = clerkExamEventOverviewSlice.actions;
