import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { FeatureFlags } from 'interfaces/featureFlags';

export interface FeatureFlagsState extends Partial<FeatureFlags> {
  status: APIResponseStatus;
}

const initialState: FeatureFlagsState = {
  status: APIResponseStatus.NotStarted,
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    loadFeatureFlags(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectFeatureFlags(state) {
      state.status = APIResponseStatus.Error;
    },
    storeFeatureFlags(_, action: PayloadAction<Partial<FeatureFlags>>) {
      return { status: APIResponseStatus.Success, ...action.payload };
    },
  },
});

export const featureFlagsReducer = featureFlagsSlice.reducer;
export const { loadFeatureFlags, rejectFeatureFlags, storeFeatureFlags } =
  featureFlagsSlice.actions;
