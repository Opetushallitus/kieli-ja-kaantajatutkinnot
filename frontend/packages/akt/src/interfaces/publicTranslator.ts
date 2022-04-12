import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { SearchFilter } from 'enums/app';
import { AutocompleteValue } from 'interfaces/components/combobox';
import { LanguagePair, LanguagePairsDict } from 'interfaces/languagePair';
import { WithId } from 'interfaces/with';

export interface PublicTranslator extends WithId {
  firstName: string;
  lastName: string;
  town?: string;
  country?: string;
  languagePairs: Array<LanguagePair>;
}

export interface PublicTranslatorFilter {
  fromLang: string;
  toLang: string;
  name: string;
  town: string;
  errors: Array<SearchFilter>;
}

export interface PublicTranslatorFilterValues {
  fromLang: AutocompleteValue;
  toLang: AutocompleteValue;
  name: string;
  town: AutocompleteValue;
}

export interface PublicTranslatorResponse {
  translators: Array<PublicTranslator>;
  langs: LanguagePairsDict;
  towns: Array<string>;
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
