import { RootState } from 'configs/redux';
import { FeatureFlagsState } from 'redux/reducers/featureFlags';

export const featureFlagsSelector = (state: RootState): FeatureFlagsState =>
  state.featureFlags;
