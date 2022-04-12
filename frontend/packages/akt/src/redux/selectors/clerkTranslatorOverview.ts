import { RootState } from 'configs/redux';
import { ClerkTranslatorOverviewState } from 'interfaces/clerkTranslatorOverview';

export const clerkTranslatorOverviewSelector = (
  state: RootState
): ClerkTranslatorOverviewState => state.clerkTranslatorOverview;
