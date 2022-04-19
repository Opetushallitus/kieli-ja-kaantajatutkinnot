import { Action } from 'redux';

import { WithId } from 'interfaces/withId';
import { APIAuthorisation, Authorisation } from 'interfaces/authorisation';
import { LanguagePairsDict } from 'interfaces/language';
import { APIResponseStatus } from 'enums/api';
import { AuthorisationStatus } from 'enums/clerkTranslator';

interface ClerkTranslatorContactDetails {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  identityNumber?: string;
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
}

export interface ClerkTranslator extends WithId {
  contactDetails: ClerkTranslatorContactDetails;
  authorisations: Array<Authorisation>;
}

export interface ClerkTranslatorResponse {
  translators: Array<ClerkTranslator>;
  langs: LanguagePairsDict;
  towns: string[];
}

export interface APIClerkTranslator
  extends Omit<ClerkTranslator, 'authorisations'> {
  authorisations: Array<APIAuthorisation>;
}

export interface ClerkTranslatorAPIResponse {
  translators: Array<APIClerkTranslator>;
  langs: LanguagePairsDict;
  towns: string[];
}

export interface ClerkTranslatorAction
  extends Action<string>,
    Partial<ClerkTranslatorResponse> {
  index?: number;
  filters?: ClerkTranslatorFilter;
}

export interface ClerkTranslatorFilter {
  fromLang: string;
  toLang: string;
  name: string;
  town: string;
  authorisationStatus: AuthorisationStatus;
}

export interface ClerkTranslatorState extends ClerkTranslatorResponse {
  selectedTranslators: Array<number>;
  status: APIResponseStatus;
  filters: ClerkTranslatorFilter;
}
