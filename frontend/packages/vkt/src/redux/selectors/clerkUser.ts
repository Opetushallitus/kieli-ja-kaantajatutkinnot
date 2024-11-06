import { RootState } from 'configs/redux';
import { ClerkUserState } from 'interfaces/clerkUser';

export const clerkUserSelector = (state: RootState): ClerkUserState =>
  state.clerkUser;
