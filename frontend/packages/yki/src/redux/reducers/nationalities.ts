import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { NationalitiesResponse, Nationality } from 'interfaces/nationality';
import { SerializationUtils } from 'utils/serialization';

export interface NationalityCodesState {
  status: APIResponseStatus;
  nationalities: Array<Nationality>;
}

const initialState: NationalityCodesState = {
  status: APIResponseStatus.NotStarted,
  nationalities: [],
};

const nationalitiesSlice = createSlice({
  name: 'nationalities',
  initialState,
  reducers: {
    acceptNationalities(state, action: PayloadAction<NationalitiesResponse>) {
      state.status = APIResponseStatus.Success;
      state.nationalities = SerializationUtils.deserializeNationalitiesResponse(
        action.payload
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
