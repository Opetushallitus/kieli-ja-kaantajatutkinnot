import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { AddAuthorisationState, Authorisation } from 'interfaces/authorisation';

const initialState: AddAuthorisationState = {
  status: APIResponseStatus.NotStarted,
  authorisation: {},
};

const authorisationSlice = createSlice({
  name: 'authorisation',
  initialState,
  reducers: {
    addAuthorisation(state, action: PayloadAction<Authorisation>) {
      state.authorisation = action.payload;
      state.status = APIResponseStatus.InProgress;
    },
    addingAuthorisationSucceeded(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectAuthorisation(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const authorisationReducer = authorisationSlice.reducer;
export const {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisation,
} = authorisationSlice.actions;
