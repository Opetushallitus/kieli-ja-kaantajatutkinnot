import { RootState } from 'configs/redux';
import { PublicEnrollmentState } from 'redux/reducers/publicEnrollment';

export const publicEnrollmentSelector = (
  state: RootState,
): PublicEnrollmentState => state.publicEnrollment;
