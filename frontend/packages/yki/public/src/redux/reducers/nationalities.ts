import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { CodeElement, KoodistoResponse } from 'interfaces/code';
import { SerializationUtils } from 'utils/serialization';

export interface NationalityCodesState {
  status: APIResponseStatus;
  nationalities: Array<CodeElement>;
}

const initialState: NationalityCodesState = {
  status: APIResponseStatus.NotStarted,
  nationalities: [],
};

const nationalitiesSlice = createSlice({
  name: 'nationalities',
  initialState,
  reducers: {
    acceptNationalities(state, action: PayloadAction<KoodistoResponse>) {
      state.status = APIResponseStatus.Success;
      state.nationalities = SerializationUtils.deserializeKoodistoResponse(
        action.payload,
      );
    },
    loadNationalities(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectNationalities(state) {
      state.status = APIResponseStatus.Cancelled;
    },
  },
});

export const nationalitiesReducer = nationalitiesSlice.reducer;
export const { acceptNationalities, loadNationalities, rejectNationalities } =
  nationalitiesSlice.actions;
