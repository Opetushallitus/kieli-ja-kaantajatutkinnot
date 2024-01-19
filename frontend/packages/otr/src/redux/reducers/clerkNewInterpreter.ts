import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { ClerkNewInterpreter } from 'interfaces/clerkNewInterpreter';
import { ClerkPerson } from 'interfaces/clerkPerson';

interface ClerkNewInterpreterState extends Partial<WithId> {
  status: APIResponseStatus;
  interpreter: ClerkNewInterpreter;
}

const initialState: ClerkNewInterpreterState = {
  interpreter: {
    onrId: undefined,
    isIndividualised: undefined,
    hasIndividualisedAddress: undefined,
    identityNumber: '',
    lastName: '',
    firstName: '',
    nickName: '',
    email: '',
    phoneNumber: '',
    otherContactInfo: '',
    street: '',
    postalCode: '',
    town: '',
    country: '',
    extraInformation: '',
    permissionToPublishEmail: false,
    permissionToPublishPhone: false,
    permissionToPublishOtherContactInfo: false,
    regions: [],
    qualifications: [],
  },
  status: APIResponseStatus.NotStarted,
  id: undefined,
};

const clerkNewInterpreterSlice = createSlice({
  name: 'clerkNewInterpreter',
  initialState,
  reducers: {
    initialiseClerkNewInterpreterByIdentityNumber(
      state,
      action: PayloadAction<string>,
    ) {
      state.interpreter.identityNumber = action.payload;
    },
    initialiseClerkNewInterpreterByPerson(
      state,
      action: PayloadAction<ClerkPerson>,
    ) {
      const person = action.payload;

      state.interpreter.onrId = person.onrId;
      state.interpreter.isIndividualised = person.isIndividualised;
      state.interpreter.hasIndividualisedAddress =
        person.hasIndividualisedAddress;
      state.interpreter.identityNumber = person.identityNumber;
      state.interpreter.lastName = person.lastName;
      state.interpreter.firstName = person.firstName;
      state.interpreter.nickName = person.nickName;
      state.interpreter.street = person.street;
      state.interpreter.postalCode = person.postalCode;
      state.interpreter.town = person.town;
      state.interpreter.country = person.country;
    },
    rejectClerkNewInterpreter(state) {
      state.status = APIResponseStatus.Error;
    },
    resetClerkNewInterpreter(state) {
      state.interpreter = initialState.interpreter;
      state.status = initialState.status;
      state.id = initialState.id;
    },
    saveClerkNewInterpreter(
      state,
      _action: PayloadAction<ClerkNewInterpreter>,
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkNewInterpreter(state, action: PayloadAction<number>) {
      state.status = APIResponseStatus.Success;
      state.id = action.payload;
    },
    updateClerkNewInterpreter(
      state,
      action: PayloadAction<ClerkNewInterpreter>,
    ) {
      state.interpreter = action.payload;
    },
  },
});

export const clerkNewInterpreterReducer = clerkNewInterpreterSlice.reducer;
export const {
  initialiseClerkNewInterpreterByIdentityNumber,
  initialiseClerkNewInterpreterByPerson,
  rejectClerkNewInterpreter,
  resetClerkNewInterpreter,
  saveClerkNewInterpreter,
  storeClerkNewInterpreter,
  updateClerkNewInterpreter,
} = clerkNewInterpreterSlice.actions;
