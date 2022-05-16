import { Action } from 'redux';
import { AutocompleteValue } from 'shared/components';
import { WithId } from 'shared/interfaces';

import { APIResponseStatus } from 'enums/api';
import { SearchFilter } from 'enums/app';
import { LanguagePair } from 'interfaces/languagePair';

export interface PublicInterpreter extends WithId {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  otherContactInfo?: string;
  regions: Array<string>;
  languages: Array<LanguagePair>;
}

export interface PublicInterpreterFilter {
  fromLang: string;
  toLang: string;
  name: string;
  region: string;
  errors: Array<SearchFilter>;
}

export interface PublicInterpreterFilterValues {
  fromLang: AutocompleteValue;
  toLang: AutocompleteValue;
  name: string;
  region: AutocompleteValue;
}

export interface PublicInterpreterResponse {
  interpreters: Array<PublicInterpreter>;
}

export interface PublicInterpreterState extends PublicInterpreterResponse {
  status: APIResponseStatus;
  selectedInterpreters: Array<number>;
  filters: PublicInterpreterFilter;
}

export interface PublicInterpreterAction
  extends Action<string>,
    Partial<PublicInterpreterResponse> {
  index?: number;
  filters?: PublicInterpreterFilter;
  filterErrorName?: SearchFilter;
  error?: Error;
}
