import { ClerkInterpreterQualifications } from 'interfaces/clerkInterpreter';
import { LanguagePair } from 'interfaces/publicInterpreter';
import { Qualification } from 'interfaces/qualification';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';

export class QualificationUtils {
  static defaultFromLang = 'FI';
  static selectableFromLangs = ['FI'];

  static isEffective(
    { id }: Qualification,
    { effective }: ClerkInterpreterQualifications
  ) {
    return effective.map((a) => a.id).includes(id);
  }

  static languagePairMatchesLangFilters(
    { from, to }: LanguagePair,
    fromFilter?: string,
    toFilter?: string
  ) {
    const matchingFromLang = from === fromFilter || from === toFilter;
    const matchingToLang = to === fromFilter || to === toFilter;

    if (fromFilter && toFilter) {
      return matchingFromLang && matchingToLang;
    } else if (fromFilter) {
      return matchingFromLang;
    } else if (toFilter) {
      return matchingToLang;
    }

    return true;
  }

  static getQualificationsVisibleInClerkHomePage(
    qualifications: ClerkInterpreterQualifications
  ) {
    return [...qualifications.effective, ...qualifications.expiredDeduplicated];
  }

  static getKoodistoLangKeys() {
    return Object.keys(koodistoLangsFI?.otr?.koodisto?.languages);
  }
}
