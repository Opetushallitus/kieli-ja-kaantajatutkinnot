import { RootState } from 'configs/redux';
import { NationalityCodesState } from 'redux/reducers/nationalities';

export const nationalitiesSelector = (
  state: RootState,
): NationalityCodesState => state.nationalities;
