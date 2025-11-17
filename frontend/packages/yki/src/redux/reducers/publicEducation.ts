import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { FreeRegistrationBasis } from 'interfaces/freeRegistration';
import { PublicEducationState } from 'interfaces/publicEducation';

const initialState: PublicEducationState = {
  status: APIResponseStatus.NotStarted,
  koskiEducations: [],
};

const publicEducationSlice = createSlice({
  name: 'publicEducation',
  initialState,
  reducers: {
    getKoskiEducations(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectKoskiEducations(state) {
      state.status = APIResponseStatus.Error;
    },
    resetKoskiEducations(_) {
      return initialState;
    },
    acceptKoskiEducations(
      state,
      action: PayloadAction<Array<FreeRegistrationBasis>>,
    ) {
      state.status = APIResponseStatus.Success;
      state.koskiEducations = action.payload;
    },
  },
});

export const publicEducationReducer = publicEducationSlice.reducer;
export const {
  acceptKoskiEducations,
  getKoskiEducations,
  rejectKoskiEducations,
  resetKoskiEducations,
} = publicEducationSlice.actions;
