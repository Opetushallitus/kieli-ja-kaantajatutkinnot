import { AppLanguage } from 'shared/enums';

export interface CodeElement {
  code: string;
  name: string;
  language: AppLanguage;
}

interface Metadata {
  nimi: string;
  kieli: 'EN' | 'FI' | 'SV';
}

interface CodeEntry {
  koodiArvo: string;
  metadata: Array<Metadata>;
}

export type KoodistoResponse = Array<CodeEntry>;
