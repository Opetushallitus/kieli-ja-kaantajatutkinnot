import { RootState } from 'configs/redux';

export const publicReservationSelector = (state: RootState) =>
  state.publicReservationReducer;
