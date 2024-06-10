import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicFileUploadParameters,
  PublicFileUploadState,
} from 'interfaces/publicFileUpload';

const initialState: PublicFileUploadState = {
  status: APIResponseStatus.NotStarted,
};

const publicFileUploadSlice = createSlice({
  name: 'publicFileUpload',
  initialState,
  reducers: {
    startFileUpload(state, _action: PayloadAction<PublicFileUploadParameters>) {
      state.status = APIResponseStatus.InProgress;
    },
    acceptFileUpload(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectFileUpload(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const publicFileUploadReducer = publicFileUploadSlice.reducer;
export const { startFileUpload, acceptFileUpload, rejectFileUpload } =
  publicFileUploadSlice.actions;
