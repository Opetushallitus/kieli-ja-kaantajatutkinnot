import { ClerkUser } from 'interfaces/clerkUser';
import {
  CLERK_USER_LOAD,
  CLERK_USER_RECEIVED,
} from 'redux/actionTypes/clerkUser';

export const loadClerkUser = {
  type: CLERK_USER_LOAD,
};

export const setClerkUser = (clerkUser: ClerkUser) => ({
  type: CLERK_USER_RECEIVED,
  clerkUser,
});
