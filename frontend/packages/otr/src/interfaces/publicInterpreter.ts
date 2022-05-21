import { Action } from 'redux';
import { AutocompleteValue } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

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
}

export interface PublicInterpreterFilterValues {
  fromLang: AutocompleteValue;
  toLang: AutocompleteValue;
  name: string;
  region: AutocompleteValue;
}

export interface PublicInterpreterState {
  status: APIResponseStatus;
  filters: PublicInterpreterFilter;
  interpreters: Array<PublicInterpreter>;
}

export interface PublicInterpreterAction extends Action<string> {
  interpreters?: Array<PublicInterpreter>;
  index?: number;
  filters?: PublicInterpreterFilter;
}
