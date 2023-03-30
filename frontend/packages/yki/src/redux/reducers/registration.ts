import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamSession } from 'interfaces/examSessions';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';

interface RegistrationState {
  status: APIResponseStatus;
  isEmailRegistration?: boolean;
  // TODO Perhaps optional instead?
  registration: PublicSuomiFiRegistration | PublicEmailRegistration;
  examSession?: ExamSession;
}

const initialState: RegistrationState = {
  status: APIResponseStatus.NotStarted,
  registration: {
    firstNames: 'Test',
    lastName: 'Tester',
    address: '',
    postNumber: '',
    postOffice: '',
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    privacyStatementConfirmation: false,
    certificateLanguage: '',
    termsAndConditionsAgreed: false,
  },
};

const registrationSlice = createSlice({
  name: 'registrationState',
  initialState,
  reducers: {
    initRegistration(state, _examSessionId: PayloadAction<number>) {
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
      action: PayloadAction<Partial<PublicEmailRegistration>>
    ) {
      state.isEmailRegistration = true;
      state.status = APIResponseStatus.Success;
      state.registration.email = action.payload.email as string;
    },
    acceptPublicSuomiFiRegistrationInit(
      state,
      action: PayloadAction<Partial<PublicSuomiFiRegistration>>
    ) {
      state.isEmailRegistration = false;
      state.status = APIResponseStatus.Success;
      state.registration = { ...state.registration, ...action.payload };
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
