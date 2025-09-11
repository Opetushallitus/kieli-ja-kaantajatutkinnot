import { RootState } from 'configs/redux';
import { LoginLinkState } from 'redux/reducers/loginLink';
import { LoginLinkRenewState } from 'redux/reducers/loginLinkRenew';

export const loginLinkSelector = (state: RootState): LoginLinkState =>
  state.loginLink;

export const loginLinkRenewSelector = (state: RootState): LoginLinkRenewState =>
  state.loginLinkRenew;
