import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  IntegrationAssistanceDecision,
  PublicIntegrationAssistanceState,
} from 'interfaces/publicIntegrationAssistance';

const initialState: PublicIntegrationAssistanceState = {
  status: APIResponseStatus.NotStarted,
};

const publicIntegrationAssistanceSlice = createSlice({
  name: 'publicIntegrationAssistance',
  initialState,
  reducers: {
    checkIntegrationAssistance(state, action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
      state.registrationId = action.payload;
      state.decision = undefined;
    },
    acceptIntegrationAssistance(
      state,
      action: PayloadAction<IntegrationAssistanceDecision>,
    ) {
      state.status = APIResponseStatus.Success;
      state.decision = action.payload;
    },
    rejectIntegrationAssistance(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const publicIntegrationAssistanceReducer =
  publicIntegrationAssistanceSlice.reducer;
export const {
  acceptIntegrationAssistance,
  checkIntegrationAssistance,
  rejectIntegrationAssistance,
} = publicIntegrationAssistanceSlice.actions;
