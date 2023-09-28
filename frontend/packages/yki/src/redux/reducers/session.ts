import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import {
  CasAuthenticatedClerkSession,
  EmailAuthenticatedSession,
  SessionResponse,
  SuomiFiAuthenticatedSession,
} from 'interfaces/session';

interface SessionState {
  status: APIResponseStatus;
  loggedInSession?:
    | EmailAuthenticatedSession
    | SuomiFiAuthenticatedSession
    | CasAuthenticatedClerkSession;
}

const initialState: SessionState = {
  status: APIResponseStatus.NotStarted,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    acceptSession(state, action: PayloadAction<SessionResponse>) {
      state.status = APIResponseStatus.Success;
      if (!action.payload.identity) {
        state.loggedInSession = undefined;
      } else {
        state.loggedInSession = action.payload;
      }
    },
    loadSession(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectSession(state) {
      state.status = APIResponseStatus.Error;
    },
  },
});

export const sessionReducer = sessionSlice.reducer;
export const { acceptSession, loadSession, rejectSession } =
  sessionSlice.actions;
