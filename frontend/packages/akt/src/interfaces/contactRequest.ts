import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { LanguagePair } from 'interfaces/languagePair';

export interface ContactDetails {
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
}

export interface ContactRequest extends ContactDetails {
  message: string;
  translatorIds: Array<number>;
  languagePair: LanguagePair;
}

export interface ContactRequestState {
  status: APIResponseStatus;
  activeStep: ContactRequestFormStep;
  request?: Partial<ContactRequest>;
  messageError: string;
}

export interface ContactRequestAction extends Action {
  request?: ContactRequest;
  messageError?: string;
}
