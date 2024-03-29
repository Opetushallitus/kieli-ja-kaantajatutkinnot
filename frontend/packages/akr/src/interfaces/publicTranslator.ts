import { SearchFilter } from 'enums/app';
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
  fromLang: string;
  toLang: string;
  name: string;
  town: string;
}

export interface PublicTown {
  name: string;
  nameSv: string;
  country?: string;
}

export interface PublicTranslatorResponse {
  translators: Array<PublicTranslator>;
  langs: LanguagePairsDict;
  towns: Array<PublicTown>;
}
