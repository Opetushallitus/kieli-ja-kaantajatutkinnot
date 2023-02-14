import { createSlice } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

interface IdentificationState {
  status: APIResponseStatus;
}

const initialState: IdentificationState = {
  status: APIResponseStatus.NotStarted,
};

const identificationSlice = createSlice({
  name: 'identification',
  initialState,
  reducers: {
    startIdentification(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectIdentification(state) {
      state.status = APIResponseStatus.Error;
    },
    identificationSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
  },
});

export const identificationReducer = identificationSlice.reducer;
export const {
  startIdentification,
  rejectIdentification,
  identificationSucceeded,
} = identificationSlice.actions;
