import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { PublicLanguagePair } from 'interfaces/language';

export interface ContactDetails {
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
}

export interface ContactRequest extends ContactDetails {
  message: string;
  translatorIds: Array<number>;
  languagePair: PublicLanguagePair;
}

export interface ContactRequestState {
  status: APIResponseStatus;
  activeStep: ContactRequestFormStep;
  request?: Partial<ContactRequest>;
}

export interface ContactRequestAction extends Action {
  request?: ContactRequest;
}
