import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { CodeElement, KoodistoResponse } from 'interfaces/code';
import { SerializationUtils } from 'utils/serialization';

export interface LanguageCodesState {
  status: APIResponseStatus;
  languages: Array<CodeElement>;
}

const initialState: LanguageCodesState = {
  status: APIResponseStatus.NotStarted,
  languages: [],
};

const languagesSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {
    acceptLanguages(state, action: PayloadAction<KoodistoResponse>) {
      state.status = APIResponseStatus.Success;
      state.languages = SerializationUtils.deserializeKoodistoResponse(
        action.payload,
      );
    },
    loadLanguages(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectLanguages(state) {
      state.status = APIResponseStatus.Cancelled;
    },
  },
});

export const languagesReducer = languagesSlice.reducer;
export const { acceptLanguages, loadLanguages, rejectLanguages } =
  languagesSlice.actions;
