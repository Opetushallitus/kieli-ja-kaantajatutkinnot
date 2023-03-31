import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicEmailRegistration,
  PublicRegistrationInitResponse,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface RegistrationState {
  status: APIResponseStatus;
  isEmailRegistration?: boolean;
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration>;
}

const initialState: RegistrationState = {
  status: APIResponseStatus.NotStarted,
  registration: {},
};

const registrationSlice = createSlice({
  name: 'registrationState',
  initialState,
  reducers: {
    initRegistration(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicRegistration(state) {
      state.status = APIResponseStatus.Error;
    },
    resetPublicRegistration(_) {
      return initialState;
    },
    acceptPublicEmailRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>
    ) {
      state.status = APIResponseStatus.Success;
      state.isEmailRegistration = true;
      state.registration = {
        id: action.payload.registration_id,
        email: action.payload.user.email,
      };
    },
    acceptPublicSuomiFiRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>
    ) {
      state.status = APIResponseStatus.Success;
      state.isEmailRegistration = false;
      const { registration_id: id, user } = action.payload;
      state.registration = {
        id,
        firstNames: user.first_name,
        lastName: user.last_name,
        hasSSN: true,
        ssn: user.ssn,
      };
    },
    updatePublicRegistration(
      state,
      action: PayloadAction<
        Partial<PublicSuomiFiRegistration | PublicEmailRegistration>
      >
    ) {
      state.registration = { ...state.registration, ...action.payload };
    },
  },
});

export const registrationReducer = registrationSlice.reducer;
export const {
  acceptPublicEmailRegistrationInit,
  acceptPublicSuomiFiRegistrationInit,
  initRegistration,
  rejectPublicRegistration,
  resetPublicRegistration,
  updatePublicRegistration,
} = registrationSlice.actions;
