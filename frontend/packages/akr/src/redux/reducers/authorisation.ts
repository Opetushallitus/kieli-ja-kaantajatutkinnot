import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Authorisation } from 'interfaces/authorisation';

interface AuthorisationState {
  addStatus: APIResponseStatus;
  removeStatus: APIResponseStatus;
  updateStatus: APIResponseStatus;
}

const initialState: AuthorisationState = {
  addStatus: APIResponseStatus.NotStarted,
  removeStatus: APIResponseStatus.NotStarted,
  updateStatus: APIResponseStatus.NotStarted,
};

const authorisationSlice = createSlice({
  name: 'authorisation',
  initialState,
  reducers: {
    addAuthorisation(
      state,
      _action: PayloadAction<{
        authorisation: Authorisation;
        translatorId: number;
      }>,
    ) {
      state.addStatus = APIResponseStatus.InProgress;
    },
    addingAuthorisationSucceeded(state) {
      state.addStatus = APIResponseStatus.Success;
    },
    rejectAuthorisationAdd(state) {
      state.addStatus = APIResponseStatus.Error;
    },
    rejectAuthorisationRemove(state) {
      state.removeStatus = APIResponseStatus.Error;
    },
    removeAuthorisation(state, _action: PayloadAction<number>) {
      state.removeStatus = APIResponseStatus.InProgress;
    },
    removingAuthorisationSucceeded(state) {
      state.removeStatus = APIResponseStatus.Success;
    },
    resetAuthorisationAdd(state) {
      state.addStatus = initialState.addStatus;
    },
    resetAuthorisationRemove(state) {
      state.removeStatus = initialState.removeStatus;
    },
    updateAuthorisation(state, _action: PayloadAction<Authorisation>) {
      state.updateStatus = APIResponseStatus.InProgress;
    },
    rejectAuthorisationUpdate(state) {
      state.updateStatus = APIResponseStatus.Error;
    },
    updatingAuthorisationSucceeded(state) {
      state.updateStatus = APIResponseStatus.Success;
    },
    resetAuthorisationUpdate(state) {
      state.updateStatus = initialState.updateStatus;
    },
  },
});

export const authorisationReducer = authorisationSlice.reducer;
export const {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisationAdd,
  rejectAuthorisationRemove,
  removeAuthorisation,
  removingAuthorisationSucceeded,
  resetAuthorisationAdd,
  resetAuthorisationRemove,
  updateAuthorisation,
  rejectAuthorisationUpdate,
  updatingAuthorisationSucceeded,
  resetAuthorisationUpdate,
} = authorisationSlice.actions;
