import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  PublicFileUploadState,
  UploadPostPolicy,
} from 'interfaces/publicFileUpload';

const initialState: PublicFileUploadState = {
  policy: { status: APIResponseStatus.NotStarted },
  fileUpload: { status: APIResponseStatus.NotStarted },
};

const publicFileUploadSlice = createSlice({
  name: 'publicFileUpload',
  initialState,
  reducers: {
    loadUploadPostPolicy(state, action: PayloadAction<number>) {
      state.policy.status = APIResponseStatus.InProgress;
      state.policy.examEventId = action.payload;
    },
    rejectUploadPostPolicy(state) {
      state.policy.status = APIResponseStatus.Error;
    },
    acceptUploadPostPolicy(state, action: PayloadAction<UploadPostPolicy>) {
      return {
        ...state,
        policy: { status: APIResponseStatus.Success, ...action.payload },
      };
    },
    startFileUpload(state, _action: PayloadAction<File>) {
      state.fileUpload.status = APIResponseStatus.InProgress;
    },
    acceptFileUpload(state) {
      state.fileUpload.status = APIResponseStatus.Success;
    },
    rejectFileUpload(state) {
      state.fileUpload.status = APIResponseStatus.Error;
    },
  },
});

export const publicFileUploadReducer = publicFileUploadSlice.reducer;
export const {
  loadUploadPostPolicy,
  rejectUploadPostPolicy,
  acceptUploadPostPolicy,
  startFileUpload,
  acceptFileUpload,
  rejectFileUpload,
} = publicFileUploadSlice.actions;
