import { Reducer } from 'redux';

import { APIResponseStatus } from 'enums/api';
import {
  ClerkNewTranslator,
  ClerkNewTranslatorAction,
  ClerkNewTranslatorState,
} from 'interfaces/clerkNewTranslator';
import {
  CLERK_NEW_TRANSLATOR_ERROR,
  CLERK_NEW_TRANSLATOR_RESET_DETAILS,
  CLERK_NEW_TRANSLATOR_RESET_REQUEST_STATUS,
  CLERK_NEW_TRANSLATOR_SAVE,
  CLERK_NEW_TRANSLATOR_SUCCESS,
  CLERK_NEW_TRANSLATOR_UPDATE,
} from 'redux/actionTypes/clerkNewTranslator';

const defaultState: ClerkNewTranslatorState = {
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

export const clerkNewTranslatorReducer: Reducer<
  ClerkNewTranslatorState,
  ClerkNewTranslatorAction
> = (state = defaultState, action) => {
  switch (action.type) {
    case CLERK_NEW_TRANSLATOR_SAVE:
      return { ...state, status: APIResponseStatus.InProgress };
    case CLERK_NEW_TRANSLATOR_RESET_REQUEST_STATUS:
      return { ...state, status: APIResponseStatus.NotStarted };
    case CLERK_NEW_TRANSLATOR_RESET_DETAILS:
      return { ...state, translator: defaultState.translator };
    case CLERK_NEW_TRANSLATOR_UPDATE:
      const translator = action.translator as ClerkNewTranslator;

      return { ...state, translator };
    case CLERK_NEW_TRANSLATOR_ERROR:
      return { ...state, status: APIResponseStatus.Error };
    case CLERK_NEW_TRANSLATOR_SUCCESS:
      const id = action.id;

      return {
        ...state,
        status: APIResponseStatus.Success,
        id,
      };
  }

  return state;
};
