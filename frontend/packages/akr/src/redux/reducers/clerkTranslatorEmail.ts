import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ClerkTranslatorEmail,
  ClerkTranslatorEmailState,
} from 'interfaces/clerkTranslatorEmail';

const initialState: ClerkTranslatorEmailState = {
  status: APIResponseStatus.NotStarted,
  email: {
    subject: '',
    body: '',
  },
  recipients: [],
};

const clerkTranslatorEmailSlice = createSlice({
  name: 'clerkTranslatorEmail',
  initialState,
  reducers: {
    cancelClerkTranslatorEmail(state) {
      state.status = APIResponseStatus.Cancelled;
    },
    rejectClerkTranslatorEmail(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkTranslatorEmail(state) {
      state.status = initialState.status;
      state.email = initialState.email;
      state.recipients = initialState.recipients;
    },
    sendClerkTranslatorEmail(state) {
      state.status = APIResponseStatus.InProgress;
    },
    sendingClerkTranslatorEmailSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
    setClerkTranslatorEmail(
      state,
      action: PayloadAction<Partial<ClerkTranslatorEmail>>
    ) {
      state.email = { ...state.email, ...action.payload };
    },
    setClerkTranslatorEmailRecipients(
      state,
      action: PayloadAction<Array<number>>
    ) {
      state.recipients = action.payload;
    },
  },
});

export const clerkTranslatorEmailReducer = clerkTranslatorEmailSlice.reducer;
export const {
  cancelClerkTranslatorEmail,
  rejectClerkTranslatorEmail,
  resetClerkTranslatorEmail,
  sendClerkTranslatorEmail,
  sendingClerkTranslatorEmailSucceeded,
  setClerkTranslatorEmail,
  setClerkTranslatorEmailRecipients,
} = clerkTranslatorEmailSlice.actions;
