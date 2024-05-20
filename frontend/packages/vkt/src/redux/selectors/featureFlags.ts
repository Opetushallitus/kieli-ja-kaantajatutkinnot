import { RootState } from 'configs/redux';

export const featureFlagsSelector = (state: RootState) => state.featureFlags;
