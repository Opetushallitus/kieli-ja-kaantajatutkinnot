import { AppLanguage } from 'shared/enums';

export interface Nationality {
  code: string;
  name: string;
  language: AppLanguage;
}

interface NationalityMetadata {
  nimi: string;
  kieli: 'EN' | 'FI' | 'SV';
}

interface NationalityResponseEntry {
  koodiArvo: string;
  metadata: Array<NationalityMetadata>;
}

export type NationalitiesResponse = Array<NationalityResponseEntry>;
