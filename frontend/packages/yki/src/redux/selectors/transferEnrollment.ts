import { RootState } from 'configs/redux';
import { TransferEnrollmentState } from 'redux/reducers/transferEnrollment';

export const transferEnrollmentSelector = (
  state: RootState,
): TransferEnrollmentState => state.transferEnrollment;
