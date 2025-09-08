import { RootState } from 'configs/redux';
import { UserDetailsState } from 'redux/reducers/userDetails';

export const userDetailsSelector = (state: RootState): UserDetailsState =>
  state.userDetails;
