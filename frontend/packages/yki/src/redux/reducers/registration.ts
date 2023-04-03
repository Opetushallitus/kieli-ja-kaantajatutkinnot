import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicEmailRegistration,
  PublicRegistrationInitResponse,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface RegistrationState {
  initRegistrationStatus: APIResponseStatus;
  submitRegistrationStatus: APIResponseStatus;
  isEmailRegistration?: boolean;
  registration: Partial<PublicSuomiFiRegistration | PublicEmailRegistration>;
}

const initialState: RegistrationState = {
  initRegistrationStatus: APIResponseStatus.NotStarted,
  submitRegistrationStatus: APIResponseStatus.NotStarted,
  registration: {},
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    initRegistration(state, _action: PayloadAction<number>) {
      state.initRegistrationStatus = APIResponseStatus.InProgress;
    },
    rejectPublicRegistrationInit(state) {
      state.initRegistrationStatus = APIResponseStatus.Error;
    },
    resetPublicRegistration() {
      return initialState;
    },
    acceptPublicEmailRegistrationInit(
      state,
      action: PayloadAction<PublicRegistrationInitResponse>
    ) {
      state.initRegistrationStatus = APIResponseStatus.Success;
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
      state.initRegistrationStatus = APIResponseStatus.Success;
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
  rejectPublicRegistrationInit,
  resetPublicRegistration,
  updatePublicRegistration,
} = registrationSlice.actions;
