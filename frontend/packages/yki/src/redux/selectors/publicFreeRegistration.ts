import { RootState } from 'configs/redux';
import { PublicFreeRegistrationDetails } from 'interfaces/publicFreeRegistration';

export const publicFreeRegistrationSelector = (
  state: RootState,
): PublicFreeRegistrationDetails => state.publicFreeRegistration;
