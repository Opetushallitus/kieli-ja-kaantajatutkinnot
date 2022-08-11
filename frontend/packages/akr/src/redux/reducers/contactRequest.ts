import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ContactRequestFormStep } from 'enums/contactRequest';
import { ContactRequest, ContactRequestState } from 'interfaces/contactRequest';

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
    rejectContactRequest(state) {
      state.status = APIResponseStatus.Error;
    },
    setContactRequestMessageError(state, action: PayloadAction<string>) {
      state.messageError = action.payload;
    },
    sendContactRequest(state, _action: PayloadAction<ContactRequest>) {
      state.status = APIResponseStatus.InProgress;
    },
    sendingContactRequestSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
    setContactRequest(state, action: PayloadAction<Partial<ContactRequest>>) {
      state.request = { ...state.request, ...action.payload };
    },
    resetAndRedirectContactRequest(state) {
      state.status = initialState.status;
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
  setContactRequest,
  resetAndRedirectContactRequest,
} = contactRequestSlice.actions;
