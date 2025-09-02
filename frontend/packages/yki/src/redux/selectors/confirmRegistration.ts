import { RootState } from 'configs/redux';
import { ConfirmRegistrationState } from 'redux/reducers/confirmRegistration';

export const confirmRegistrationSelector = (
  state: RootState,
): ConfirmRegistrationState => state.confirmRegistration;
