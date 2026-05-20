import { RootState } from 'configs/redux';
import { UserState } from 'redux/reducers/user';

export const userSelector = (state: RootState): UserState => state.user;
