import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  CountryOfEducation,
  PublicFreeRegistrationDetails,
  UserDeclaredEducationDetails,
} from 'interfaces/publicFreeRegistration';

const initialState: PublicFreeRegistrationDetails = {
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
    setUserDeclaredFreeRegistration(
      state,
      action: PayloadAction<Partial<UserDeclaredEducationDetails>>,
    ) {
      const { countryOfEducation, educationDetails } = action.payload;
      const completeSelection = countryOfEducation && educationDetails;
      const paymentRequired =
        countryOfEducation === 'uneligible' ||
        educationDetails === 'uneligible';
      if (completeSelection) {
        state.isFree = paymentRequired ? 'NO' : 'YES';
        if (paymentRequired) {
          state.basis = undefined;
        } else {
          const country = countryOfEducation as CountryOfEducation;
          const educationType =
            educationDetails === 'matriculationExam'
              ? 'MatriculationExam'
              : educationDetails === 'higherEducationConcluded'
              ? 'HigherEducationConcluded'
              : 'HigherEducationEnrolled';
          state.basis = {
            countryOfEducation: country,
            educationType,
            source: 'USER',
          };
        }
      } else {
        state.isFree = paymentRequired ? 'NO' : 'UNDECIDED';
        state.basis = undefined;
      }
    },
  },
});

export const publicFreeRegistrationReducer =
  publicFreeRegistrationSlice.reducer;
export const {
  resetPublicFreeRegistration,
  setPublicFreeRegistration,
  setUserDeclaredFreeRegistration,
} = publicFreeRegistrationSlice.actions;
