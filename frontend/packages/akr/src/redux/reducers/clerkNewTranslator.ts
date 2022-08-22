import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { ResponseState } from 'interfaces/responseState';
import { WithId } from 'interfaces/with';

interface ClerkNewTranslatorState extends ResponseState, Partial<WithId> {
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
  id: undefined,
};

const clerkNewTranslatorSlice = createSlice({
  name: 'clerkNewTranslator',
  initialState,
  reducers: {
    rejectClerkNewTranslator(state, action: PayloadAction<AxiosError>) {
      state.status = APIResponseStatus.Error;
      state.error = action.payload;
    },
    resetClerkNewTranslator(state) {
      state.translator = initialState.translator;
      state.status = initialState.status;
      state.id = initialState.id;
      state.error = undefined;
    },
    saveClerkNewTranslator(state, _action: PayloadAction<ClerkNewTranslator>) {
      state.status = APIResponseStatus.InProgress;
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
  rejectClerkNewTranslator,
  resetClerkNewTranslator,
  saveClerkNewTranslator,
  storeClerkNewTranslator,
  updateClerkNewTranslator,
} = clerkNewTranslatorSlice.actions;
