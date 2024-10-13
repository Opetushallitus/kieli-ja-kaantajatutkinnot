import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';

export interface PublicEnrollmentContactState {
  loadEnrollmentStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollmentContact;
}

const initialState: PublicEnrollmentContactState = {
  loadEnrollmentStatus: APIResponseStatus.NotStarted,
  enrollmentSubmitStatus: APIResponseStatus.NotStarted,
  paymentLoadingStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  enrollment: {
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    oralSkill: false,
    textualSkill: false,
    understandingSkill: false,
    speakingPartialExam: false,
    speechComprehensionPartialExam: false,
    writingPartialExam: false,
    readingComprehensionPartialExam: false,
    id: 1,
    hasPreviousEnrollment: undefined,
    previousEnrollment: '',
    privacyStatementConfirmation: false,
    status: undefined,
  },
};

const publicEnrollmentContactSlice = createSlice({
  name: 'publicEnrollmentContact',
  initialState,
  reducers: {
    loadPublicEnrollmentContact(state, _action: PayloadAction<number>) {
      state.loadEnrollmentStatus = APIResponseStatus.InProgress;
    },
    rejectPublicEnrollmentContact(state) {
      state.loadEnrollmentStatus = APIResponseStatus.Error;
    },
    storePublicEnrollmentContactSave(
      state,
      action: PayloadAction<PublicEnrollmentContact>,
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.Success;
      state.enrollment = action.payload;
    },
    storePublicEnrollmentContact(
      state,
      action: PayloadAction<PublicEnrollmentContact>,
    ) {
      state.loadEnrollmentStatus = APIResponseStatus.Success;
      state.enrollment = action.payload;
    },
    updatePublicEnrollment(
      state,
      action: PayloadAction<Partial<PublicEnrollmentContact>>,
    ) {
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
    loadPublicEnrollmentSave(
      state,
      _action: PayloadAction<PublicEnrollmentContact>,
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.InProgress;
    },
  },
});

export const publicEnrollmentContactReducer =
  publicEnrollmentContactSlice.reducer;
export const {
  loadPublicEnrollmentContact,
  rejectPublicEnrollmentContact,
  storePublicEnrollmentContactSave,
  storePublicEnrollmentContact,
  updatePublicEnrollment,
  loadPublicEnrollmentSave,
} = publicEnrollmentContactSlice.actions;
