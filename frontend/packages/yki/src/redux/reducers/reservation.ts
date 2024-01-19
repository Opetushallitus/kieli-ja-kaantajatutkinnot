import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  ReservationErrorCause,
  ReservationRequest,
} from 'interfaces/reservation';

interface ReservationState extends Partial<ReservationRequest> {
  status: APIResponseStatus;
  errorCause?: ReservationErrorCause;
}

const initialState: ReservationState = {
  status: APIResponseStatus.NotStarted,
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    acceptReservationRequest(state) {
      state.status = APIResponseStatus.Success;
    },
    rejectReservationRequest(
      state,
      action: PayloadAction<ReservationErrorCause>
    ) {
      state.status = APIResponseStatus.Error;
      state.errorCause = action.payload;
    },
    resetReservationRequest(_) {
      return initialState;
    },
    sendReservationRequest(state, action: PayloadAction<ReservationRequest>) {
      state.status = APIResponseStatus.InProgress;
      state.errorCause = undefined;
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
