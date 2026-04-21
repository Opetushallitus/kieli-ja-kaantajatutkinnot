import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkQuarantineMatch,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';

interface ClerkQuarantineState {
  matches: ClerkQuarantineMatch[];
  sort: ClerkQuarantineSort;
  status: APIResponseStatus;
  reviewStatus: APIResponseStatus;
  lastReviewAction: 'matchConfirmed' | 'matchRejected' | null;
}

const initialState: ClerkQuarantineState = {
  matches: [],
  sort: 'examDate:asc',
  status: APIResponseStatus.NotStarted,
  reviewStatus: APIResponseStatus.NotStarted,
  lastReviewAction: null,
};

const clerkQuarantineSlice = createSlice({
  name: 'clerkQuarantine',
  initialState,
  reducers: {
    loadClerkQuarantineMatches(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkQuarantineMatches(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkQuarantineMatches(
      state,
      action: PayloadAction<ClerkQuarantineMatch[]>,
    ) {
      state.status = APIResponseStatus.Success;
      state.matches = action.payload;
    },
    setQuarantineSort(state, action: PayloadAction<ClerkQuarantineSort>) {
      state.sort = action.payload;
    },
    setQuarantineReview(
      state,
      action: PayloadAction<{
        quarantineId: number;
        registrationId: number;
        matchConfirmed: boolean;
      }>,
    ) {
      state.reviewStatus = APIResponseStatus.InProgress;
      state.lastReviewAction = action.payload.matchConfirmed
        ? 'matchConfirmed'
        : 'matchRejected';
    },
    resolveQuarantineReview(state) {
      state.reviewStatus = APIResponseStatus.Success;
    },
    rejectQuarantineReview(state) {
      state.reviewStatus = APIResponseStatus.Error;
    },
    resetQuarantineReviewStatus(state) {
      state.reviewStatus = APIResponseStatus.NotStarted;
      state.lastReviewAction = null;
    },
  },
});

export const clerkQuarantineReducer = clerkQuarantineSlice.reducer;
export const {
  loadClerkQuarantineMatches,
  rejectClerkQuarantineMatches,
  rejectQuarantineReview,
  resetQuarantineReviewStatus,
  resolveQuarantineReview,
  setQuarantineReview,
  setQuarantineSort,
  storeClerkQuarantineMatches,
} = clerkQuarantineSlice.actions;
