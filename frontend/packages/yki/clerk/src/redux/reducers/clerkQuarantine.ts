import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkQuarantineMatch,
  ClerkQuarantineReview,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';

interface ClerkQuarantineState {
  matches: ClerkQuarantineMatch[];
  reviews: ClerkQuarantineReview[];
  sort: ClerkQuarantineSort;
  status: APIResponseStatus;
  reviewsStatus: APIResponseStatus;
  reviewStatus: APIResponseStatus;
  lastReviewAction: 'matchConfirmed' | 'matchRejected' | null;
}

const initialState: ClerkQuarantineState = {
  matches: [],
  reviews: [],
  sort: 'examDate:asc',
  status: APIResponseStatus.NotStarted,
  reviewsStatus: APIResponseStatus.NotStarted,
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
    loadClerkQuarantineReviews(state) {
      state.reviewsStatus = APIResponseStatus.InProgress;
    },
    rejectClerkQuarantineReviews(state) {
      state.reviewsStatus = APIResponseStatus.Error;
    },
    storeClerkQuarantineReviews(
      state,
      action: PayloadAction<ClerkQuarantineReview[]>,
    ) {
      state.reviewsStatus = APIResponseStatus.Success;
      state.reviews = action.payload;
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
  storeClerkQuarantineMatches,
  loadClerkQuarantineReviews,
  rejectClerkQuarantineReviews,
  storeClerkQuarantineReviews,
  setQuarantineSort,
  setQuarantineReview,
  resolveQuarantineReview,
  rejectQuarantineReview,
  resetQuarantineReviewStatus,
} = clerkQuarantineSlice.actions;
