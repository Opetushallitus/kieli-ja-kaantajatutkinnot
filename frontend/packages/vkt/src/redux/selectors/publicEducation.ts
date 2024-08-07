import { RootState } from 'configs/redux';
import { PublicEducationState } from 'redux/reducers/publicEducation';

export const publicEducationSelector: (
  state: RootState,
) => PublicEducationState = (state: RootState) => state.publicEducation;
