import { Authorisation, AuthorisationBasis } from 'interfaces/authorisation';
import {
  ClerkTranslator,
  ClerkTranslatorAuthorisations,
} from 'interfaces/clerkTranslator';
import { LanguagePair } from 'interfaces/languagePair';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';

export class AuthorisationUtils {
  static primaryLangs = ['FI', 'SV', 'SEIN', 'SEKO', 'SEPO'];

  static newAuthorisation: Authorisation = {
    languagePair: { from: '', to: '' },
    basis: null as unknown as AuthorisationBasis,
    termBeginDate: undefined,
    termEndDate: undefined,
    permissionToPublish: true,
    diaryNumber: '',
    examinationDate: undefined,
  };

  static selectableLanguagesForLanguageFilter(
    languages: Array<string>,
    otherLanguage?: string,
  ) {
    if (!otherLanguage || this.primaryLangs.includes(otherLanguage)) {
      return languages;
    }

    return this.primaryLangs.filter((lang) => languages.includes(lang));
  }

  static isEffective(
    { id }: Authorisation,
    { effective }: ClerkTranslatorAuthorisations,
  ) {
    return effective.map((a) => a.id).includes(id);
  }

  static getLanguagePairLocalisation(
    { from, to }: LanguagePair,
    translateLanguage: (l: string) => string,
  ) {
    return `${translateLanguage(from)} - ${translateLanguage(to)}`;
  }

  static getKoodistoLangKeys() {
    return Object.keys(koodistoLangsFI?.akr?.koodisto?.languages);
  }

  static deceasedIsUnhandled(deceased: ClerkTranslator) {
    return (
      deceased.authorisations.effective.find((a) => a.permissionToPublish) ||
      deceased.authorisations.expiring.find((a) => a.permissionToPublish) ||
      deceased.authorisations.expiredDeduplicated.find(
        (a) => a.permissionToPublish,
      ) ||
      deceased.authorisations.formerVir.find((a) => a.permissionToPublish)
    );
  }
}
