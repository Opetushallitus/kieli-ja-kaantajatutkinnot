import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkNewTranslator } from 'interfaces/clerkNewTranslator';
import { ClerkPerson } from 'interfaces/clerkPerson';
import { WithId } from 'interfaces/with';

interface ClerkNewTranslatorState extends Partial<WithId> {
  status: APIResponseStatus;
  translator: ClerkNewTranslator;
}

const initialState: ClerkNewTranslatorState = {
  translator: {
    onrId: undefined,
    isIndividualised: undefined,
    hasIndividualisedAddress: undefined,
    lastName: '',
    firstName: '',
    nickName: '',
    identityNumber: '',
    street: '',
    postalCode: '',
    town: '',
    country: '',
    email: '',
    phoneNumber: '',
    extraInformation: '',
    isAssuranceGiven: false,
    authorisations: [],
  },
  status: APIResponseStatus.NotStarted,
  id: undefined,
};

const clerkNewTranslatorSlice = createSlice({
  name: 'clerkNewTranslator',
  initialState,
  reducers: {
    initialiseClerkNewTranslatorByIdentityNumber(
      state,
      action: PayloadAction<string>
    ) {
      state.translator.identityNumber = action.payload;
    },
    initialiseClerkNewTranslatorByPerson(
      state,
      action: PayloadAction<ClerkPerson>
    ) {
      const person = action.payload;

      state.translator.onrId = person.onrId;
      state.translator.isIndividualised = person.isIndividualised;
      state.translator.hasIndividualisedAddress =
        person.hasIndividualisedAddress;
      state.translator.identityNumber = person.identityNumber;
      state.translator.lastName = person.lastName;
      state.translator.firstName = person.firstName;
      state.translator.nickName = person.nickName;
      state.translator.street = person.street;
      state.translator.postalCode = person.postalCode;
      state.translator.town = person.town;
      state.translator.country = person.country;
    },
    rejectClerkNewTranslator(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkNewTranslator(state) {
      state.translator = initialState.translator;
      state.status = initialState.status;
      state.id = initialState.id;
    },
    saveClerkNewTranslator(state, _action: PayloadAction<ClerkNewTranslator>) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkNewTranslator(state, action: PayloadAction<number>) {
      state.status = APIResponseStatus.Success;
      state.id = action.payload;
    },
    updateClerkNewTranslator(state, action: PayloadAction<ClerkNewTranslator>) {
      state.translator = action.payload;
    },
  },
});

export const clerkNewTranslatorReducer = clerkNewTranslatorSlice.reducer;
export const {
  initialiseClerkNewTranslatorByIdentityNumber,
  initialiseClerkNewTranslatorByPerson,
  rejectClerkNewTranslator,
  resetClerkNewTranslator,
  saveClerkNewTranslator,
  storeClerkNewTranslator,
  updateClerkNewTranslator,
} = clerkNewTranslatorSlice.actions;
