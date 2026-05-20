import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ActiveQuarantinesSort,
  ClerkActiveQuarantine,
  ClerkQuarantineMatch,
  ClerkQuarantineReview,
  ClerkQuarantineSort,
  CreateClerkQuarantineRequest,
  UpdateClerkQuarantineRequest,
} from 'interfaces/clerkQuarantine';

interface ClerkQuarantineState {
  matches: ClerkQuarantineMatch[];
  reviews: ClerkQuarantineReview[];
  activeQuarantines: ClerkActiveQuarantine[];
  sort: ClerkQuarantineSort;
  activeQuarantinesSort: ActiveQuarantinesSort;
  status: APIResponseStatus;
  reviewsStatus: APIResponseStatus;
  activeQuarantinesStatus: APIResponseStatus;
  reviewStatus: APIResponseStatus;
  lastReviewAction: 'matchConfirmed' | 'matchRejected' | null;
  createStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
}

const initialState: ClerkQuarantineState = {
  matches: [],
  reviews: [],
  activeQuarantines: [],
  sort: 'examDate:asc',
  activeQuarantinesSort: 'startDate:asc',
  status: APIResponseStatus.NotStarted,
  reviewsStatus: APIResponseStatus.NotStarted,
  activeQuarantinesStatus: APIResponseStatus.NotStarted,
  reviewStatus: APIResponseStatus.NotStarted,
  lastReviewAction: null,
  createStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
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
    loadClerkActiveQuarantines(state) {
      state.activeQuarantinesStatus = APIResponseStatus.InProgress;
    },
    rejectClerkActiveQuarantines(state) {
      state.activeQuarantinesStatus = APIResponseStatus.Error;
    },
    storeClerkActiveQuarantines(
      state,
      action: PayloadAction<ClerkActiveQuarantine[]>,
    ) {
      state.activeQuarantinesStatus = APIResponseStatus.Success;
      state.activeQuarantines = action.payload;
    },
    setActiveQuarantinesSort(
      state,
      action: PayloadAction<ActiveQuarantinesSort>,
    ) {
      state.activeQuarantinesSort = action.payload;
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
    createClerkQuarantine(
      state,
      _action: PayloadAction<CreateClerkQuarantineRequest>,
    ) {
      state.createStatus = APIResponseStatus.InProgress;
    },
    resolveCreateClerkQuarantine(state) {
      state.createStatus = APIResponseStatus.Success;
    },
    rejectCreateClerkQuarantine(state) {
      state.createStatus = APIResponseStatus.Error;
    },
    resetCreateClerkQuarantineStatus(state) {
      state.createStatus = APIResponseStatus.NotStarted;
    },
    updateClerkQuarantine(
      state,
      _action: PayloadAction<UpdateClerkQuarantineRequest>,
    ) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    resolveUpdateClerkQuarantine(state) {
      state.updateStatus = APIResponseStatus.Success;
    },
    rejectUpdateClerkQuarantine(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    resetUpdateClerkQuarantineStatus(state) {
      state.updateStatus = APIResponseStatus.NotStarted;
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
  loadClerkActiveQuarantines,
  rejectClerkActiveQuarantines,
  storeClerkActiveQuarantines,
  setActiveQuarantinesSort,
  setQuarantineSort,
  setQuarantineReview,
  resolveQuarantineReview,
  rejectQuarantineReview,
  resetQuarantineReviewStatus,
  createClerkQuarantine,
  resolveCreateClerkQuarantine,
  rejectCreateClerkQuarantine,
  resetCreateClerkQuarantineStatus,
  updateClerkQuarantine,
  resolveUpdateClerkQuarantine,
  rejectUpdateClerkQuarantine,
  resetUpdateClerkQuarantineStatus,
} = clerkQuarantineSlice.actions;
