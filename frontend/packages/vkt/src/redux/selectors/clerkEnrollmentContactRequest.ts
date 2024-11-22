import { RootState } from 'configs/redux';
import { ClerkEnrollmentContactRequestState } from 'redux/reducers/clerkEnrollmentContactRequest';

export const clerkEnrollmentContactRequestSelector = (
  state: RootState,
): ClerkEnrollmentContactRequestState => state.clerkEnrollmentContactRequest;
