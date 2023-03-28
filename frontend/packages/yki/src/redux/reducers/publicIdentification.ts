import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

export interface EmailLinkOrder {
  email?: string;
  examSessionId?: number;
}

interface EmailLinkOrderState extends Partial<EmailLinkOrder> {
  status: APIResponseStatus;
}

interface PublicIdentificationState {
  emailLinkOrder: EmailLinkOrderState;
}

const initialState: PublicIdentificationState = {
  emailLinkOrder: {
    status: APIResponseStatus.NotStarted,
  },
};

const publicIdentificationSlice = createSlice({
  name: 'publicIdentification',
  initialState,
  reducers: {
    acceptEmailLinkOrder(state) {
      state.emailLinkOrder.status = APIResponseStatus.Success;
    },
    rejectEmailLinkOrder(state) {
      state.emailLinkOrder.status = APIResponseStatus.Error;
    },
    sendEmailLinkOrder(state, action: PayloadAction<EmailLinkOrder>) {
      state.emailLinkOrder.status = APIResponseStatus.InProgress;
      state.emailLinkOrder.email = action.payload.email;
      state.emailLinkOrder.examSessionId = action.payload.examSessionId;
    },
  },
});

export const publicIdentificationReducer = publicIdentificationSlice.reducer;
export const {
  acceptEmailLinkOrder,
  rejectEmailLinkOrder,
  sendEmailLinkOrder,
} = publicIdentificationSlice.actions;
