import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import {
  CLERK_NEW_TRANSLATOR_RESET_DETAILS,
  CLERK_NEW_TRANSLATOR_RESET_REQUEST_STATUS,
  CLERK_NEW_TRANSLATOR_SAVE,
  CLERK_NEW_TRANSLATOR_UPDATE,
} from 'redux/actionTypes/clerkNewTranslator';

export const resetNewClerkTranslatorRequestStatus = {
  type: CLERK_NEW_TRANSLATOR_RESET_REQUEST_STATUS,
};
export const resetNewClerkTranslatorDetails = {
  type: CLERK_NEW_TRANSLATOR_RESET_DETAILS,
};

export const updateNewClerkTranslator = (translator: ClerkNewTranslator) => ({
  type: CLERK_NEW_TRANSLATOR_UPDATE,
  translator,
});

export const saveNewClerkTranslator = (translator: ClerkNewTranslator) => ({
  type: CLERK_NEW_TRANSLATOR_SAVE,
  translator,
});
