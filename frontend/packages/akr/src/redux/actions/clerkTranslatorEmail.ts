import { ClerkTranslatorEmail } from 'interfaces/clerkTranslatorEmail';
import {
  CLERK_TRANSLATOR_EMAIL_RESET,
  CLERK_TRANSLATOR_EMAIL_SEND,
  CLERK_TRANSLATOR_EMAIL_SET,
  CLERK_TRANSLATOR_EMAIL_SET_RECIPIENTS,
} from 'redux/actionTypes/clerkTranslatorEmail';

export const resetClerkTranslatorEmail = {
  type: CLERK_TRANSLATOR_EMAIL_RESET,
};

export const sendClerkTranslatorEmail = {
  type: CLERK_TRANSLATOR_EMAIL_SEND,
};

export const setClerkTranslatorEmailRecipients = (
  recipientIds: Array<number>
) => ({
  type: CLERK_TRANSLATOR_EMAIL_SET_RECIPIENTS,
  recipientIds,
});

export const setClerkTranslatorEmail = (
  email: Partial<ClerkTranslatorEmail>
) => ({
  type: CLERK_TRANSLATOR_EMAIL_SET,
  email,
});
