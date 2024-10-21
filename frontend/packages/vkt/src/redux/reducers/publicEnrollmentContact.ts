import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export interface PublicEnrollmentContactState {
  loadExamEventStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollmentContact;
  examEvent?: PublicExamEvent;
}

const initialState: PublicEnrollmentContactState = {
  loadExamEventStatus: APIResponseStatus.NotStarted,
  enrollmentSubmitStatus: APIResponseStatus.NotStarted,
  paymentLoadingStatus: APIResponseStatus.NotStarted,
  cancelStatus: APIResponseStatus.NotStarted,
  enrollment: {
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
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
  examEvent: undefined,
};

const publicEnrollmentContactSlice = createSlice({
  name: 'publicEnrollmentContact',
  initialState,
  reducers: {
    loadPublicExamEvent(state, _action: PayloadAction<number>) {
      state.loadExamEventStatus = APIResponseStatus.InProgress;
    },
    rejectPublicExamEvent(state) {
      state.loadExamEventStatus = APIResponseStatus.Error;
    },
    storePublicExamEvent(state, action: PayloadAction<PublicExamEvent>) {
      state.enrollmentSubmitStatus = APIResponseStatus.Success;
      state.examEvent = action.payload;
    },
    updatePublicEnrollment(
      state,
      action: PayloadAction<Partial<PublicEnrollmentContact>>,
    ) {
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
    loadPublicEnrollmentSave(
      state,
      _action: PayloadAction<{
        enrollment: PublicEnrollmentContact;
        examinerId: number;
      }>,
    ) {
      state.enrollmentSubmitStatus = APIResponseStatus.InProgress;
    },
    storePublicEnrollmentSave(state) {
      state.enrollmentSubmitStatus = APIResponseStatus.Success;
    },
    rejectPublicEnrollmentSave(state) {
      state.enrollmentSubmitStatus = APIResponseStatus.Error;
    },
  },
});

export const publicEnrollmentContactReducer =
  publicEnrollmentContactSlice.reducer;
export const {
  loadPublicEnrollmentSave,
  rejectPublicEnrollmentSave,
  storePublicEnrollmentSave,
  rejectPublicExamEvent,
  storePublicExamEvent,
  loadPublicExamEvent,
  updatePublicEnrollment,
} = publicEnrollmentContactSlice.actions;
