import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';
import { PublicReservation } from 'interfaces/publicReservation';

interface PublicReservationState {
  status: APIResponseStatus;
  id?: number;
  expiresAt?: Dayjs;
  examEvent?: PublicExamEvent;
  person?: PublicPerson;
}

const initialState: PublicReservationState = {
  status: APIResponseStatus.NotStarted,
  id: undefined,
  expiresAt: undefined,
  examEvent: undefined,
  person: undefined,
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
      state.id = action.payload.id;
      state.expiresAt = action.payload.expiresAt;
      state.examEvent = action.payload.examEvent;
      state.person = action.payload.person;
    },
  },
});

export const publicReservationReducer = publicReservationSlice.reducer;
export const { loadReservation, rejectReservation, storeReservation } =
  publicReservationSlice.actions;
