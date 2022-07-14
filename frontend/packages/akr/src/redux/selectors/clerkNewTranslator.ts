import { RootState } from 'configs/redux';
import { ClerkNewTranslatorState } from 'interfaces/clerkNewTranslator';

export const clerkNewTranslatorSelector = (
  state: RootState
): ClerkNewTranslatorState => state.clerkNewTranslator;
