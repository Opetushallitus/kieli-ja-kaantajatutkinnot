import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Authorisation } from 'interfaces/authorisation';

interface AuthorisationState {
  status: APIResponseStatus;
}

const initialState: AuthorisationState = {
  status: APIResponseStatus.NotStarted,
};

const authorisationSlice = createSlice({
  name: 'authorisation',
  initialState,
  reducers: {
    addAuthorisation(state, _action: PayloadAction<Authorisation>) {
      state.status = APIResponseStatus.InProgress;
    },
    addingAuthorisationSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectAuthorisation(state) {
      state.status = APIResponseStatus.Error;
    },
    resetAuthorisation(state) {
      state.status = initialState.status;
    },
  },
});

export const authorisationReducer = authorisationSlice.reducer;
export const {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisation,
  resetAuthorisation,
} = authorisationSlice.actions;
