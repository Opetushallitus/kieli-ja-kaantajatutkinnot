import { RootState } from 'configs/redux';
import { SessionState } from 'redux/reducers/session';

export const sessionSelector = (state: RootState): SessionState =>
  state.session;
