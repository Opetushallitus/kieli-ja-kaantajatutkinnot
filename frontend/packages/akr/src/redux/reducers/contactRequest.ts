import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { ContactRequestFormStep } from 'enums/contactRequest';
import { ContactRequest } from 'interfaces/contactRequest';
import { ResponseState } from 'interfaces/responseState';

interface ContactRequestState extends ResponseState {
  activeStep: ContactRequestFormStep;
  request?: Partial<ContactRequest>;
  messageError: string;
}

const initialState: ContactRequestState = {
  status: APIResponseStatus.NotStarted,
  activeStep: ContactRequestFormStep.VerifyTranslators,
  request: {
    languagePair: { from: '', to: '' },
    translatorIds: [],
    email: '',
    firstName: '',
    lastName: '',
    message: '',
    phoneNumber: '',
    confirmation: false,
  },
  messageError: '',
};

const contactRequestSlice = createSlice({
  name: 'contactRequest',
  initialState,
  reducers: {
    decreaseContactRequestStep(state) {
      state.activeStep = --state.activeStep;
    },
    increaseContactRequestStep(state) {
      state.activeStep = ++state.activeStep;
    },
    rejectContactRequest(state, action: PayloadAction<AxiosError>) {
      state.status = APIResponseStatus.Error;
      state.error = action.payload;
    },
    setContactRequestMessageError(state, action: PayloadAction<string>) {
      state.messageError = action.payload;
    },
    sendContactRequest(state, _action: PayloadAction<ContactRequest>) {
      state.status = APIResponseStatus.InProgress;
      state.error = initialState.error;
    },
    sendingContactRequestSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
    updateContactRequest(
      state,
      action: PayloadAction<Partial<ContactRequest>>
    ) {
      state.request = { ...state.request, ...action.payload };
    },
    concludeContactRequest(state) {
      state.status = initialState.status;
      state.error = initialState.error;
      state.activeStep = initialState.activeStep;
      state.request = initialState.request;
      state.messageError = initialState.messageError;
    },
  },
});

export const contactRequestReducer = contactRequestSlice.reducer;
export const {
  decreaseContactRequestStep,
  increaseContactRequestStep,
  rejectContactRequest,
  setContactRequestMessageError,
  sendContactRequest,
  sendingContactRequestSucceeded,
  updateContactRequest,
  concludeContactRequest,
} = contactRequestSlice.actions;
