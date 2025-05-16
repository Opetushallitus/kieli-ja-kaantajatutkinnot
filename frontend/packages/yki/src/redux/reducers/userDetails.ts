import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PersonDetails } from 'interfaces/userDetails';

export interface UserDetailsState {
  personDetails?: PersonDetails;
  registrations: Array<string>;
  status: APIResponseStatus;
}

const initialState: UserDetailsState = {
  personDetails: undefined,
  registrations: [],
  status: APIResponseStatus.NotStarted,
};

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    loadPersonDetails(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPersonDetails(state) {
      state.status = APIResponseStatus.Error;
    },
    storePersonDetails(state, action: PayloadAction<PersonDetails>) {
      state.status = APIResponseStatus.Success;
      state.personDetails = action.payload;
    },
  },
});

export const userDetailsReducer = userDetailsSlice.reducer;
export const { loadPersonDetails, rejectPersonDetails, storePersonDetails } =
  userDetailsSlice.actions;
