import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Qualification } from 'interfaces/qualification';

interface QualificationState {
  addStatus: APIResponseStatus;
  removeStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
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
    addQualification(
      state,
      _action: PayloadAction<{
        qualification: Qualification;
        interpreterId: number;
      }>
    ) {
      state.addStatus = APIResponseStatus.InProgress;
    },
    rejectAddQualification(state) {
      state.addStatus = APIResponseStatus.Error;
    },
    addQualificationSucceeded(state) {
      state.addStatus = APIResponseStatus.Success;
    },
    resetQualificationAdd(state) {
      state.addStatus = initialState.addStatus;
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
    resetQualificationRemove(state) {
      state.removeStatus = initialState.removeStatus;
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
    resetQualificationUpdate(state) {
      state.updateStatus = initialState.updateStatus;
    },
  },
});

export const qualificationReducer = qualificationSlice.reducer;
export const {
  addQualification,
  rejectAddQualification,
  addQualificationSucceeded,
  resetQualificationAdd,
  removeQualification,
  rejectRemoveQualification,
  removeQualificationSucceeded,
  resetQualificationRemove,
  updateQualification,
  updateQualificationSucceeded,
  rejectUpdateQualification,
  resetQualificationUpdate,
} = qualificationSlice.actions;
