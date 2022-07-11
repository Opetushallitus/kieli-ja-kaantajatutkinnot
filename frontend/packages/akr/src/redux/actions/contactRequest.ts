import { ContactRequest } from 'interfaces/contactRequest';
import {
  CONTACT_REQUEST_RESET,
  CONTACT_REQUEST_RESET_REDIRECT,
  CONTACT_REQUEST_SEND,
  CONTACT_REQUEST_SET,
  CONTACT_REQUEST_SET_MESSAGE_ERROR,
  CONTACT_REQUEST_STEP_DECREASE,
  CONTACT_REQUEST_STEP_INCREASE,
} from 'redux/actionTypes/contactRequest';

export const setContactRequest = (request: Partial<ContactRequest>) => ({
  type: CONTACT_REQUEST_SET,
  request,
});

export const sendContactRequest = (request: ContactRequest) => ({
  type: CONTACT_REQUEST_SEND,
  request,
});

export const resetContactRequest = { type: CONTACT_REQUEST_RESET };

export const resetContactRequestAndRedirect = {
  type: CONTACT_REQUEST_RESET_REDIRECT,
};

export const increaseFormStep = {
  type: CONTACT_REQUEST_STEP_INCREASE,
};

export const decreaseFormStep = {
  type: CONTACT_REQUEST_STEP_DECREASE,
};

export const setMessageError = (error?: string) => ({
  type: CONTACT_REQUEST_SET_MESSAGE_ERROR,
  messageError: error,
});
