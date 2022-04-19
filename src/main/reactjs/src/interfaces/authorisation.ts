import { ClerkLanguagePair } from 'interfaces/language';

type AuthorisationBasis = 'AUT' | 'KKT' | 'VIR';

export interface AuthorisationTerm {
  start: Date;
  end?: Date;
}

export interface APIAuthorisationTerm {
  beginDate: string;
  endDate?: string;
}

export interface Authorisation {
  basis: AuthorisationBasis;
  term?: AuthorisationTerm;
  languagePairs: Array<ClerkLanguagePair>;
}

export interface APIAuthorisation extends Omit<Authorisation, 'term'> {
  term?: APIAuthorisationTerm;
}
