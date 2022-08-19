import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Qualification } from 'interfaces/qualification';

interface QualificationState {
  addStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
  removeStatus: APIResponseStatus;
}

const initialState: QualificationState = {
  addStatus: APIResponseStatus.NotStarted,
  removeStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
};

const qualificationSlice = createSlice({
  name: 'qualification',
  initialState,
  reducers: {
    resetQualificationState(state) {
      state.removeStatus = initialState.removeStatus;
      state.addStatus = initialState.addStatus;
      state.updateStatus = initialState.updateStatus;
    },
    addQualification(state, _action: PayloadAction<Qualification>) {
      state.addStatus = APIResponseStatus.InProgress;
    },
    rejectAddQualification(state) {
      state.addStatus = APIResponseStatus.Error;
    },
    addQualificationSucceeded(state) {
      state.addStatus = APIResponseStatus.Success;
    },
    removeQualification(state, _action: PayloadAction<number>) {
      state.removeStatus = APIResponseStatus.InProgress;
    },
    rejectRemoveQualification(state) {
      state.removeStatus = APIResponseStatus.Error;
    },
    removeQualificationSucceeded(state) {
      state.removeStatus = APIResponseStatus.Success;
    },
    updateQualification(state, _action: PayloadAction<Qualification>) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    rejectUpdateQualification(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    updateQualificationSucceeded(state) {
      state.updateStatus = APIResponseStatus.Success;
    },
  },
});

export const qualificationReducer = qualificationSlice.reducer;
export const {
  resetQualificationState,
  addQualification,
  rejectAddQualification,
  addQualificationSucceeded,
  removeQualification,
  rejectRemoveQualification,
  removeQualificationSucceeded,
  updateQualification,
  updateQualificationSucceeded,
  rejectUpdateQualification,
} = qualificationSlice.actions;
