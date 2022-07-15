import dayjs, { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { AuthorisationStatus } from 'enums/clerkTranslator';
import {
  Authorisation,
  AuthorisationsGroupedByStatus,
} from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';

export class AuthorisationUtils {
  static isAuthorisationEffective(
    { termBeginDate, termEndDate }: Authorisation,
    currentDate: Dayjs
  ) {
    if (termEndDate) {
      return DateUtils.isDatePartBeforeOrEqual(currentDate, termEndDate);
    } else if (termBeginDate) {
      return true;
    } else {
      return false;
    }
  }

  static isAuthorisationExpiring(
    { termEndDate }: Authorisation,
    currentDate: Dayjs,
    expiringThreshold: Dayjs
  ) {
    return (
      termEndDate &&
      DateUtils.isDatePartBeforeOrEqual(currentDate, termEndDate) &&
      DateUtils.isDatePartBeforeOrEqual(termEndDate, expiringThreshold)
    );
  }

  static isAuthorisationExpired(
    { termEndDate }: Authorisation,
    currentDate: Dayjs
  ) {
    return (
      termEndDate &&
      !DateUtils.isDatePartBeforeOrEqual(currentDate, termEndDate)
    );
  }

  static isAuthorisationForFormerVIR({ termBeginDate }: Authorisation) {
    return !termBeginDate;
  }

  static expiringSoonThreshold(currentDate: Dayjs) {
    return currentDate.add(3, 'month');
  }

  static groupClerkTranslatorAuthorisationsByStatus(
    clerkTranslator: ClerkTranslator
  ) {
    const currentDate = dayjs();

    return clerkTranslator.authorisations.reduce(
      (group: AuthorisationsGroupedByStatus, authorisation: Authorisation) => {
        const status = AuthorisationUtils.getAuthorisationStatus(
          authorisation,
          currentDate
        );
        group[status].push(authorisation);

        return group;
      },
      { authorised: [], expiring: [], expired: [], formerVIR: [] }
    );
  }

  static getKoodistoLangKeys() {
    return Object.keys(koodistoLangsFI?.akr?.koodisto?.languages);
  }

  private static getAuthorisationStatus(
    authorisation: Authorisation,
    currentDate: Dayjs
  ) {
    let status!: AuthorisationStatus;

    if (AuthorisationUtils.isAuthorisationForFormerVIR(authorisation)) {
      status = AuthorisationStatus.FormerVIR;
    } else if (
      AuthorisationUtils.isAuthorisationExpiring(
        authorisation,
        currentDate,
        AuthorisationUtils.expiringSoonThreshold(currentDate)
      )
    ) {
      status = AuthorisationStatus.Expiring;
    } else if (
      AuthorisationUtils.isAuthorisationEffective(authorisation, currentDate)
    ) {
      status = AuthorisationStatus.Authorised;
    } else {
      status = AuthorisationStatus.Expired;
    }

    return status;
  }
}
