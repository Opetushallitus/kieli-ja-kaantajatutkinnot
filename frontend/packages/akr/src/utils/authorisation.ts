import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslatorAuthorisations } from 'interfaces/clerkTranslator';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';

export class AuthorisationUtils {
  static primaryLangs = ['FI', 'SV', 'SEIN', 'SEKO', 'SEPO'];

  static selectableLanguagesForLanguageFilter(
    languages: Array<string>,
    otherLanguage?: string
  ) {
    if (!otherLanguage || this.primaryLangs.includes(otherLanguage)) {
      return languages;
    }

    return this.primaryLangs.filter((lang) => languages.includes(lang));
  }

  static isEffective(
    { id }: Authorisation,
    { effective }: ClerkTranslatorAuthorisations
  ) {
    return effective.map((a) => a.id).includes(id);
  }

  static getKoodistoLangKeys() {
    return Object.keys(koodistoLangsFI?.akr?.koodisto?.languages);
  }
}
