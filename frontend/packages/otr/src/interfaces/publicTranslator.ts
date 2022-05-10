import { Action } from 'redux';
import { AutocompleteValue } from 'shared/components';

import { APIResponseStatus } from 'enums/api';
import { SearchFilter } from 'enums/app';
import { LanguagePair } from 'interfaces/languagePair';
import { WithId } from 'interfaces/with';

export interface PublicTranslator extends WithId {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  otherContactInfo?: string;
  regions: Array<string>;
  languages: Array<LanguagePair>;
}

export interface PublicTranslatorFilter {
  fromLang: string;
  toLang: string;
  name: string;
  region: string;
  errors: Array<SearchFilter>;
}

export interface PublicTranslatorFilterValues {
  fromLang: AutocompleteValue;
  toLang: AutocompleteValue;
  name: string;
  region: AutocompleteValue;
}

export interface PublicTranslatorResponse {
  translators: Array<PublicTranslator>;
}

export interface PublicTranslatorState extends PublicTranslatorResponse {
  status: APIResponseStatus;
  selectedTranslators: Array<number>;
  filters: PublicTranslatorFilter;
}

export interface PublicTranslatorAction
  extends Action<string>,
    Partial<PublicTranslatorResponse> {
  index?: number;
  filters?: PublicTranslatorFilter;
  filterErrorName?: SearchFilter;
  error?: Error;
}
