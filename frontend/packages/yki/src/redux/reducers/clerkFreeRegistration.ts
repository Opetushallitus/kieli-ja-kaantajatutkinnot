import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkFreeRegistration,
  ClerkFreeRegistrationSort,
} from 'interfaces/clerkFreeRegistration';

export enum FreeRegistrationModalStatus {
  NotStarted,
  ApprovalInProgress,
  ApprovalSuccess,
  ApprovalError,
  RejectInProgress,
  RejectSuccess,
  RejectError,
  SupplementRequestInProgress,
  SupplementRequestSuccess,
  SupplementRequestError,
}

interface ClerkFreeRegistrationState {
  freeRegistrations: Array<ClerkFreeRegistration>;
  freeRegistrationsSort: ClerkFreeRegistrationSort;
  status: APIResponseStatus;
  modalSubmitStatus: FreeRegistrationModalStatus;
}

const initialState: ClerkFreeRegistrationState = {
  freeRegistrations: [],
  freeRegistrationsSort: 'examDate:asc',
  status: APIResponseStatus.NotStarted,
  modalSubmitStatus: FreeRegistrationModalStatus.NotStarted,
};

const clerkFreeRegistrationSlice = createSlice({
  name: 'clerkFreeRegistration',
  initialState,
  reducers: {
    loadClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectClerkFreeRegistrations(state) {
      state.status = APIResponseStatus.Error;
    },
    storeClerkFreeRegistrations(
      state,
      action: PayloadAction<Array<ClerkFreeRegistration>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.freeRegistrations = action.payload;
    },
    setFreeRegistrationStatus(
      state,
      action: PayloadAction<FreeRegistrationModalStatus>,
    ) {
      state.modalSubmitStatus = action.payload;
    },
    approveFreeRegistration(state, _action: PayloadAction<number>) {
      state.modalSubmitStatus = FreeRegistrationModalStatus.ApprovalInProgress;
    },
    rejectFreeRegistration(state, _action: PayloadAction<number>) {
      state.modalSubmitStatus = FreeRegistrationModalStatus.RejectInProgress;
    },
    submitClerkFreeRegistrationSupplementRequest(
      state,
      _action: PayloadAction<{
        freeRegistrationId: number;
        message: string;
        dueDate: Dayjs;
      }>,
    ) {
      state.modalSubmitStatus =
        FreeRegistrationModalStatus.SupplementRequestInProgress;
    },
    rejectClerkFreeRegistrationSupplementRequest(state) {
      state.modalSubmitStatus =
        FreeRegistrationModalStatus.SupplementRequestError;
    },
    acceptClerkFreeRegistrationSupplementRequest(state) {
      state.modalSubmitStatus =
        FreeRegistrationModalStatus.SupplementRequestSuccess;
    },
    resetSupplementRequestStatus(state) {
      state.modalSubmitStatus = FreeRegistrationModalStatus.NotStarted;
    },
    setFreeRegistrationsSort(
      state,
      action: PayloadAction<ClerkFreeRegistrationSort>,
    ) {
      state.freeRegistrationsSort = action.payload;
    },
  },
});

export const clerkFreeRegistrationReducer = clerkFreeRegistrationSlice.reducer;
export const {
  loadClerkFreeRegistrations,
  rejectClerkFreeRegistrations,
  storeClerkFreeRegistrations,
  setFreeRegistrationStatus,
  approveFreeRegistration,
  rejectFreeRegistration,
  submitClerkFreeRegistrationSupplementRequest,
  rejectClerkFreeRegistrationSupplementRequest,
  acceptClerkFreeRegistrationSupplementRequest,
  resetSupplementRequestStatus,
  setFreeRegistrationsSort,
} = clerkFreeRegistrationSlice.actions;
