import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicReservation } from 'interfaces/publicReservation';

interface PublicReservationState {
  status: APIResponseStatus;
  reservation?: PublicReservation;
}

const initialState: PublicReservationState = {
  status: APIResponseStatus.NotStarted,
  reservation: undefined,
};

const publicReservationSlice = createSlice({
  name: 'publicReservation',
  initialState,
  reducers: {
    loadReservation(state, _action: PayloadAction<number>) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectReservation(state) {
      state.status = APIResponseStatus.Error;
    },
    storeReservation(state, action: PayloadAction<PublicReservation>) {
      state.status = APIResponseStatus.Success;
      state.reservation = action.payload;
    },
  },
});

export const publicReservationReducer = publicReservationSlice.reducer;
export const { loadReservation, rejectReservation, storeReservation } =
  publicReservationSlice.actions;
