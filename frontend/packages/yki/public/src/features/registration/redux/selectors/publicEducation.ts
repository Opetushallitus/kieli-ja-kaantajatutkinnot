import { RootState } from 'configs/redux';
import { PublicEducationState } from 'interfaces/publicEducation';

export const publicEducationSelector = (
  state: RootState,
): PublicEducationState => state.registrationVw.publicEducation;
