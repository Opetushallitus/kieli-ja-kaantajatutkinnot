import { RootState } from 'configs/redux';
import { LoginLinkState } from 'features/registration/redux/reducers/loginLink';

export const loginLinkSelector = (state: RootState): LoginLinkState =>
  state.registrationV2.loginLink;
