import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { WithId } from 'interfaces/with';

interface ClerkNewTranslatorState extends Partial<WithId> {
  status: APIResponseStatus;
  translator: ClerkNewTranslator;
}

const initialState: ClerkNewTranslatorState = {
  translator: {
    lastName: '',
    firstName: '',
    identityNumber: '',
    street: '',
    postalCode: '',
    town: '',
    country: '',
    email: '',
    phoneNumber: '',
    extraInformation: '',
    isAssuranceGiven: false,
    authorisations: [],
  },
  status: APIResponseStatus.NotStarted,
};

const clerkNewTranslatorSlice = createSlice({
  name: 'clerkNewTranslator',
  initialState,
  reducers: {
    resetClerkNewTranslatorDetails(state) {
      state.translator = initialState.translator;
    },
    rejectClerkNewTranslator(state) {
      state.status = APIResponseStatus.Error;
    },
    saveClerkNewTranslator(state, _action: PayloadAction<ClerkNewTranslator>) {
      state.status = APIResponseStatus.InProgress;
    },
    resetClerkNewTranslatorRequestStatus(state) {
      state.status = APIResponseStatus.NotStarted;
    },
    storeClerkNewTranslator(state, action: PayloadAction<number>) {
      state.status = APIResponseStatus.Success;
      state.id = action.payload;
    },
    updateClerkNewTranslator(state, action: PayloadAction<ClerkNewTranslator>) {
      state.translator = action.payload;
    },
  },
});

export const clerkNewTranslatorReducer = clerkNewTranslatorSlice.reducer;
export const {
  resetClerkNewTranslatorDetails,
  rejectClerkNewTranslator,
  saveClerkNewTranslator,
  resetClerkNewTranslatorRequestStatus,
  storeClerkNewTranslator,
  updateClerkNewTranslator,
} = clerkNewTranslatorSlice.actions;
