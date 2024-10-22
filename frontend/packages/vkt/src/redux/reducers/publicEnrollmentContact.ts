import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { PublicExaminer } from 'interfaces/publicExaminer';

export interface PublicEnrollmentContactState {
  loadExaminerStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollmentContact;
  examiner?: PublicExaminer;
}

const initialState: PublicEnrollmentContactState = {
  loadExaminerStatus: APIResponseStatus.NotStarted,
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
  examiner: undefined,
};

const publicEnrollmentContactSlice = createSlice({
  name: 'publicEnrollmentContact',
  initialState,
  reducers: {
    loadPublicExaminer(state, _action: PayloadAction<number>) {
      state.loadExaminerStatus = APIResponseStatus.InProgress;
    },
    rejectPublicExaminer(state) {
      state.loadExaminerStatus = APIResponseStatus.Error;
    },
    storePublicExaminer(state, action: PayloadAction<PublicExaminer>) {
      state.loadExaminerStatus = APIResponseStatus.Success;
      state.examiner = action.payload;
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
  rejectPublicExaminer,
  storePublicExaminer,
  loadPublicExaminer,
  updatePublicEnrollment,
} = publicEnrollmentContactSlice.actions;
