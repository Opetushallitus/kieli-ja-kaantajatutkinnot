import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { APIResponseStatus } from 'shared/enums';

import { Authorisation } from 'interfaces/authorisation';
import { ResponseState } from 'interfaces/responseState';

const initialState: ResponseState = {
  status: APIResponseStatus.NotStarted,
};

const authorisationSlice = createSlice({
  name: 'authorisation',
  initialState,
  reducers: {
    addAuthorisation(state, _action: PayloadAction<Authorisation>) {
      state.status = APIResponseStatus.InProgress;
      state.error = initialState.error;
    },
    addingAuthorisationSucceeded(state) {
      state.status = APIResponseStatus.Success;
      state.error = initialState.error;
    },
    rejectAuthorisation(state, action: PayloadAction<AxiosError>) {
      state.status = APIResponseStatus.Error;
      state.error = action.payload;
    },
  },
});

export const authorisationReducer = authorisationSlice.reducer;
export const {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisation,
} = authorisationSlice.actions;
