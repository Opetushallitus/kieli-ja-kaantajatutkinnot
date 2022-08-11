import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Qualification, QualificationState } from 'interfaces/qualification';

const initialState: QualificationState = {
  addQualificationStatus: APIResponseStatus.NotStarted,
  removeQualificationStatus: APIResponseStatus.NotStarted,
  qualification: {},
};

const qualificationSlice = createSlice({
  name: 'qualification',
  initialState,
  reducers: {
    resetQualification(state) {
      state.removeQualificationStatus = initialState.removeQualificationStatus;
      state.addQualificationStatus = initialState.addQualificationStatus;
      state.qualification = initialState.qualification;
    },
    addQualification(state, action: PayloadAction<Qualification>) {
      state.addQualificationStatus = APIResponseStatus.InProgress;
      state.qualification = action.payload;
    },
    rejectAddQualification(state) {
      state.addQualificationStatus = APIResponseStatus.Error;
    },
    addQualificationSuccess(state) {
      state.addQualificationStatus = APIResponseStatus.Success;
    },
    removeQualification(state, _action: PayloadAction<number>) {
      state.removeQualificationStatus = APIResponseStatus.InProgress;
    },
    rejectRemoveQualification(state) {
      state.addQualificationStatus = APIResponseStatus.Error;
    },
    removeQualificationSuccess(state) {
      state.addQualificationStatus = APIResponseStatus.Success;
    },
  },
});

export const qualifcationReducer = qualificationSlice.reducer;
export const {
  addQualification,
  rejectAddQualification,
  addQualificationSuccess,
  resetQualification,
  removeQualification,
  rejectRemoveQualification,
  removeQualificationSuccess,
} = qualificationSlice.actions;
