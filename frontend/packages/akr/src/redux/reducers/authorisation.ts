import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { Authorisation } from 'interfaces/authorisation';

interface AuthorisationState {
  addStatus: APIResponseStatus;
  removeStatus: APIResponseStatus;
  updatePublishPermissionStatus: APIResponseStatus;
}

const initialState: AuthorisationState = {
  addStatus: APIResponseStatus.NotStarted,
  removeStatus: APIResponseStatus.NotStarted,
  updatePublishPermissionStatus: APIResponseStatus.NotStarted,
};

const authorisationSlice = createSlice({
  name: 'authorisation',
  initialState,
  reducers: {
    addAuthorisation(state, _action: PayloadAction<Authorisation>) {
      state.addStatus = APIResponseStatus.InProgress;
    },
    addingAuthorisationSucceeded(state) {
      state.addStatus = APIResponseStatus.Success;
    },
    rejectAuthorisationAdd(state) {
      state.addStatus = APIResponseStatus.Error;
    },
    rejectAuthorisationPublishPermissionUpdate(state) {
      state.updatePublishPermissionStatus = APIResponseStatus.Error;
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
    resetAuthorisationPublishPermissionUpdate(state) {
      state.updatePublishPermissionStatus =
        initialState.updatePublishPermissionStatus;
    },
    resetAuthorisationRemove(state) {
      state.removeStatus = initialState.removeStatus;
    },
    updateAuthorisationPublishPermission(
      state,
      _action: PayloadAction<Authorisation>
    ) {
      state.updatePublishPermissionStatus = APIResponseStatus.InProgress;
    },
    updatingAuthorisationPublishPermissionSucceeded(state) {
      state.updatePublishPermissionStatus = APIResponseStatus.Success;
    },
  },
});

export const authorisationReducer = authorisationSlice.reducer;
export const {
  addAuthorisation,
  addingAuthorisationSucceeded,
  rejectAuthorisationAdd,
  rejectAuthorisationPublishPermissionUpdate,
  rejectAuthorisationRemove,
  removeAuthorisation,
  removingAuthorisationSucceeded,
  resetAuthorisationAdd,
  resetAuthorisationPublishPermissionUpdate,
  resetAuthorisationRemove,
  updateAuthorisationPublishPermission,
  updatingAuthorisationPublishPermissionSucceeded,
} = authorisationSlice.actions;
