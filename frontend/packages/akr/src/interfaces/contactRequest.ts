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
  confirmation: boolean;
}
