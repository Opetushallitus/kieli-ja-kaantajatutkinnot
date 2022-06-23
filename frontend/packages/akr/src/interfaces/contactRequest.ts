import { AxiosError } from 'axios';
import { Action } from 'redux';
import { APIResponseStatus } from 'shared/enums';

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
  error?: AxiosError;
}

export interface ContactRequestAction extends Action {
  request?: ContactRequest;
  messageError?: string;
  error?: AxiosError;
}
