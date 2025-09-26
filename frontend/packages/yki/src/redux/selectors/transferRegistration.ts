import { RootState } from 'configs/redux';
import { TransferRegistrationState } from 'redux/reducers/transferRegistration';

export const transferRegistrationSelector = (
  state: RootState,
): TransferRegistrationState => state.transferRegistration;
