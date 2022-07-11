import { RootState } from 'configs/redux';
import { ClerkTranslatorEmailState } from 'interfaces/clerkTranslatorEmail';

export const selectClerkTranslatorEmail = (
  state: RootState
): ClerkTranslatorEmailState => state.clerkTranslatorEmail;
