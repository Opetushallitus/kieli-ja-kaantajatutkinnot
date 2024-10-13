import { RootState } from 'configs/redux';
import { PublicEnrollmentContactState } from 'redux/reducers/publicEnrollmentContact';

export const publicEnrollmentContactSelector = (
  state: RootState,
): PublicEnrollmentContactState => state.publicEnrollmentContact;
