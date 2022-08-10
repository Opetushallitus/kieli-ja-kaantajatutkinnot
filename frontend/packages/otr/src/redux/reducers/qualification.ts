import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Qualification, QualificationState } from 'interfaces/qualification';

const initialState: QualificationState = {
  status: APIResponseStatus.NotStarted,
  qualification: {},
};

const qualificationSlice = createSlice({
  name: 'qualification',
  initialState,
  reducers: {
    resetQualification(state) {
      state.status = initialState.status;
      state.qualification = initialState.qualification;
    },
    addQualification(state, action: PayloadAction<Qualification>) {
      state.status = APIResponseStatus.InProgress;
      state.qualification = action.payload;
    },
    rejectAddQualification(state) {
      state.status = APIResponseStatus.Error;
    },
    addQualificationSuccess(state) {
      state.status = APIResponseStatus.Success;
    },
  },
});

export const qualifcationReducer = qualificationSlice.reducer;
export const {
  addQualification,
  rejectAddQualification,
  addQualificationSuccess,
  resetQualification,
} = qualificationSlice.actions;
