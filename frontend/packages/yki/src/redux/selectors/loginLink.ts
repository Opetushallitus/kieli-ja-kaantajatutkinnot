import { RootState } from 'configs/redux';
import { LoginLinkState } from 'redux/reducers/loginLink';

export const loginLinkSelector = (state: RootState): LoginLinkState =>
  state.loginLink;
