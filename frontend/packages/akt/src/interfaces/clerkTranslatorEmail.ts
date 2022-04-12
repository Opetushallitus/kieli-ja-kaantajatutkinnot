import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';

export interface ClerkTranslatorEmail {
  subject: string;
  body: string;
}

export interface ClerkTranslatorEmailState {
  status: APIResponseStatus;
  email: ClerkTranslatorEmail;
  recipients: Array<number>;
}

export interface ClerkTranslatorEmailAction extends Action<string> {
  email: Partial<ClerkTranslatorEmail>;
  recipientIds: Array<number>;
}
