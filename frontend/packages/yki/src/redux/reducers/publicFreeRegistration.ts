import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PublicFreeRegistrationDetails } from 'interfaces/publicFreeRegistration';

const initialState: PublicFreeRegistrationDetails = {
  attemptsUsed: {
    fin: 2,
    swe: 2,
  },
  /*isFree: 'YES',
  basis: {
    source: 'KOSKI',
    educationType: 'ComparableHigherEducationStudies',
    isActive: false,
  },
  */
  isFree: 'UNDECIDED',
};

const publicFreeRegistrationSlice = createSlice({
  name: 'publicFreeRegistration',
  initialState,
  reducers: {
    resetPublicFreeRegistration(_) {
      return initialState;
    },
    setPublicFreeRegistration(
      state,
      action: PayloadAction<Partial<PublicFreeRegistrationDetails>>,
    ) {
      return { ...state, ...action.payload };
    },
  },
});

export const publicFreeRegistrationReducer =
  publicFreeRegistrationSlice.reducer;
export const { resetPublicFreeRegistration, setPublicFreeRegistration } =
  publicFreeRegistrationSlice.actions;
