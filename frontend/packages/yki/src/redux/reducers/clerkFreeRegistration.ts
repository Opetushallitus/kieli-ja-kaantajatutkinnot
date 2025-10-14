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
  InformationRequestInProgress,
  InformationRequestSuccess,
  InformationRequestError,
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
    approveFreeRegistration(state) {
      state.modalSubmitStatus = FreeRegistrationModalStatus.ApprovalInProgress;
    },
    rejectFreeRegistration(state) {
      state.modalSubmitStatus = FreeRegistrationModalStatus.RejectInProgress;
    },
    submitClerkFreeRegistrationInformationRequest(
      state,
      _action: PayloadAction<{
        registrationId: number;
        message: string;
        dueDate: Dayjs;
      }>,
    ) {
      state.modalSubmitStatus =
        FreeRegistrationModalStatus.InformationRequestInProgress;
    },
    rejectClerkFreeRegistrationInformationRequest(state) {
      state.modalSubmitStatus =
        FreeRegistrationModalStatus.InformationRequestError;
    },
    acceptClerkFreeRegistrationInformationRequest(state) {
      state.modalSubmitStatus =
        FreeRegistrationModalStatus.InformationRequestSuccess;
    },
    resetInformationRequestStatus(state) {
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
  submitClerkFreeRegistrationInformationRequest,
  rejectClerkFreeRegistrationInformationRequest,
  acceptClerkFreeRegistrationInformationRequest,
  resetInformationRequestStatus,
  setFreeRegistrationsSort,
} = clerkFreeRegistrationSlice.actions;
