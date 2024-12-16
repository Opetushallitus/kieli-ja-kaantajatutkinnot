import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentContact } from 'interfaces/clerkEnrollment';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';

export interface ClerkEnrollmentContactRequestState {
  status: APIResponseStatus;
  deleteStatus: APIResponseStatus;
  enrollment?: ClerkEnrollmentContact;
  createStatus: APIResponseStatus;
  examEventsStatus: APIResponseStatus;
  examEvents: Array<ExaminerExamEvent>;
}

const initialState: ClerkEnrollmentContactRequestState = {
  status: APIResponseStatus.NotStarted,
  createStatus: APIResponseStatus.NotStarted,
  deleteStatus: APIResponseStatus.NotStarted,
  examEventsStatus: APIResponseStatus.NotStarted,
  examEvents: [],
};

const clerkEnrollmentContactRequestSlice = createSlice({
  name: 'clerkEnrollmentContactRequest',
  initialState,
  reducers: {
    loadExaminerExamEvents(state, _action: PayloadAction<string>) {
      state.examEventsStatus = APIResponseStatus.InProgress;
    },
    storeExaminerExamEvents(
      state,
      action: PayloadAction<Array<ExaminerExamEvent>>,
    ) {
      state.examEvents = action.payload;
      state.examEventsStatus = APIResponseStatus.Success;
    },
    loadClerkEnrollmentContactRequest(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
      state.status = APIResponseStatus.InProgress;
    },
    storeClerkEnrollmentContactRequest(
      state,
      action: PayloadAction<ClerkEnrollmentContact>,
    ) {
      state.enrollment = action.payload;
      state.status = APIResponseStatus.Success;
    },
    rejectClerkEnrollmentContactRequest(state) {
      state.status = APIResponseStatus.Error;
    },
    createClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
        examEvent: number;
      }>,
    ) {
      state.createStatus = APIResponseStatus.InProgress;
    },
    storeCreateClerkEnrollmentAppointment(
      state,
      _action: PayloadAction<ClerkEnrollmentContact>,
    ) {
      state.createStatus = APIResponseStatus.Success;
    },
    rejectCreateClerkEnrollmentAppointment(state) {
      state.createStatus = APIResponseStatus.Error;
    },
    resetClerkEnrollmentContactRequestToInitialState(_state) {
      return initialState;
    },
    deleteClerkEnrollmentContactRequest(
      state,
      _action: PayloadAction<{
        id: number;
        oid: string;
      }>,
    ) {
      state.deleteStatus = APIResponseStatus.InProgress;
    },
    storeDeleteClerkEnrollmentContactRequest(state) {
      state.deleteStatus = APIResponseStatus.Success;
    },
  },
});

export const clerkEnrollmentContactRequestReducer =
  clerkEnrollmentContactRequestSlice.reducer;
export const {
  storeExaminerExamEvents,
  loadExaminerExamEvents,
  rejectClerkEnrollmentContactRequest,
  storeClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
  createClerkEnrollmentAppointment,
  storeCreateClerkEnrollmentAppointment,
  rejectCreateClerkEnrollmentAppointment,
  resetClerkEnrollmentContactRequestToInitialState,
  deleteClerkEnrollmentContactRequest,
  storeDeleteClerkEnrollmentContactRequest,
} = clerkEnrollmentContactRequestSlice.actions;
