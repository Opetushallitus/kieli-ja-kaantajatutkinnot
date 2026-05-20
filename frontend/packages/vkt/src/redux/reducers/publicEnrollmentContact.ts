import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { Attachment } from 'interfaces/publicEducation';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { PublicExaminer } from 'interfaces/publicExaminer';

export interface PublicEnrollmentContactState {
  loadExaminerStatus: APIResponseStatus;
  enrollmentSubmitStatus: APIResponseStatus;
  paymentLoadingStatus: APIResponseStatus;
  cancelStatus: APIResponseStatus;
  enrollment: PublicEnrollmentContact;
  contactDetailsNeedConfirmation: boolean;
  examiner?: PublicExaminer;
  contactedExaminers: Array<WithId>;
}

export const initialState: PublicEnrollmentContactState = {
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
    isFullExam: undefined,
    id: 1,
    hasPreviousEnrollment: undefined,
    privacyStatementConfirmation: false,
    status: undefined,
    message: '',
    attachments: [],
  },
  contactDetailsNeedConfirmation: false,
  examiner: undefined,
  contactedExaminers: [],
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
    updatePublicEnrollmentContact(
      state,
      action: PayloadAction<Partial<PublicEnrollmentContact>>,
    ) {
      state.enrollment = { ...state.enrollment, ...action.payload };
    },
    markExaminerAsContacted(state, action: PayloadAction<WithId>) {
      state.contactedExaminers = [...state.contactedExaminers, action.payload];
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
    continueWithEnrollmentDetails({ contactedExaminers, enrollment }) {
      const { id: _id, ...enrollmentDetails } = enrollment;

      return {
        ...initialState,
        contactedExaminers,
        enrollment: enrollmentDetails,
        contactDetailsNeedConfirmation: true,
      };
    },
    confirmContactDetails(state) {
      state.contactDetailsNeedConfirmation = false;
    },
    rejectPreviousContactDetails(state) {
      state.contactDetailsNeedConfirmation = false;
      state.contactedExaminers = initialState.contactedExaminers;
      state.enrollment = initialState.enrollment;
    },
    storeContactAttachment(state, action: PayloadAction<Attachment>) {
      state.enrollment.attachments = [
        ...(state.enrollment.attachments ?? []),
        action.payload,
      ];
    },
    removeContactAttachment(state, action: PayloadAction<Attachment>) {
      state.enrollment.attachments = state.enrollment.attachments?.filter(
        (a) => a.id !== action.payload.id,
      );
    },
    resetPublicEnrollmentContact() {
      return initialState;
    },
    resetPublicEnrollmentContactStates(state) {
      return {
        ...state,
        loadExaminerStatus: APIResponseStatus.NotStarted,
        enrollmentSubmitStatus: APIResponseStatus.NotStarted,
        paymentLoadingStatus: APIResponseStatus.NotStarted,
        cancelStatus: APIResponseStatus.NotStarted,
      };
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
  updatePublicEnrollmentContact,
  storeContactAttachment,
  removeContactAttachment,
  resetPublicEnrollmentContact,
  markExaminerAsContacted,
  continueWithEnrollmentDetails,
  confirmContactDetails,
  rejectPreviousContactDetails,
  resetPublicEnrollmentContactStates,
} = publicEnrollmentContactSlice.actions;
