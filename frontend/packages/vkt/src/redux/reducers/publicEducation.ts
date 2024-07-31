import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Education } from 'interfaces/publicEducation';

export interface PublicEducationState {
  status: APIResponseStatus;
  education?: Array<Education>;
}

const initialState: PublicEducationState = {
  status: APIResponseStatus.NotStarted,
  education: undefined,
};

const publicEducationSlice = createSlice({
  name: 'publicEducation',
  initialState,
  reducers: {
    loadPublicEducation(state, _action: PayloadAction) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicEducation(state) {
      state.status = APIResponseStatus.Error;
      state.education = initialState.education;
    },
    storePublicEducation(state, action: PayloadAction<Array<Education>>) {
      state.status = APIResponseStatus.Success;
      state.education = action.payload;
    },
  },
});

export const publicEducationReducer = publicEducationSlice.reducer;
export const {
  loadPublicEducation,
  rejectPublicEducation,
  storePublicEducation,
} = publicEducationSlice.actions;
