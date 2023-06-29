import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ReservationRequest } from 'interfaces/reservation';

interface ReservationState extends Partial<ReservationRequest> {
  status: APIResponseStatus;
  emailAlreadyQueued: boolean;
}

const initialState: ReservationState = {
  status: APIResponseStatus.NotStarted,
  emailAlreadyQueued: false,
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    acceptReservationRequest(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectReservationRequest(state, action: PayloadAction<boolean>) {
      state.status = APIResponseStatus.Error;
      state.emailAlreadyQueued = action.payload;
    },
    resetReservationRequest(_) {
      return initialState;
    },
    sendReservationRequest(state, action: PayloadAction<ReservationRequest>) {
      state.status = APIResponseStatus.InProgress;
      state.email = action.payload.email;
      state.examSessionId = action.payload.examSessionId;
    },
  },
});

export const reservationReducer = reservationSlice.reducer;
export const {
  acceptReservationRequest,
  rejectReservationRequest,
  resetReservationRequest,
  sendReservationRequest,
} = reservationSlice.actions;
