import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamSession } from 'interfaces/clerkExamSession';

export interface ClerkExamSessionEditForm {
  maxParticipants: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  contactInfo: string;
}

const initialEditForm: ClerkExamSessionEditForm = {
  maxParticipants: '',
  streetAddress: '',
  postalCode: '',
  city: '',
  contactInfo: '',
};

interface ClerkExamSessionState {
  clerkExamSession: ClerkExamSession | null;
  status: APIResponseStatus;
  updateStatus: APIResponseStatus;
  editForm: ClerkExamSessionEditForm;
}

const initialState: ClerkExamSessionState = {
  clerkExamSession: null,
  status: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
  editForm: initialEditForm,
};

const clerkExamSessionSlice = createSlice({
  name: 'clerkExamSession',
  initialState,
  reducers: {
    loadClerkExamSessionDetails(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectExamSessionDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storeExamSessionDetails(state, action: PayloadAction<ClerkExamSession>) {
      state.status = APIResponseStatus.Success;
      state.clerkExamSession = action.payload;
    },
    saveExamSession(
      state,
      _action: PayloadAction<{ examSessionId: number; form: ClerkExamSessionEditForm }>,
    ) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    acceptSaveExamSession(state, action: PayloadAction<ClerkExamSession>) {
      state.updateStatus = APIResponseStatus.Success;
      state.clerkExamSession = action.payload;
      state.editForm = initialEditForm;
    },
    rejectSaveExamSession(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    resetUpdateStatus(state) {
      state.updateStatus = APIResponseStatus.NotStarted;
    },
    updateEditForm(
      state,
      action: PayloadAction<Partial<ClerkExamSessionEditForm>>,
    ) {
      state.editForm = { ...state.editForm, ...action.payload };
    },
    resetEditForm(state) {
      state.editForm = initialEditForm;
    },
  },
});

export const clerkExamSessionReducer = clerkExamSessionSlice.reducer;
export const {
  loadClerkExamSessionDetails,
  rejectExamSessionDetails,
  storeExamSessionDetails,
  saveExamSession,
  acceptSaveExamSession,
  rejectSaveExamSession,
  resetUpdateStatus,
  updateEditForm,
  resetEditForm,
} = clerkExamSessionSlice.actions;
