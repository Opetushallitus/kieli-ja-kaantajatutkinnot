import dayjs, { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import {
  Qualification,
  QualificationsGroupedByStatus,
} from 'interfaces/qualification';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';

export class QualificationUtils {
  static isQualificationEffective(
    { beginDate, endDate }: Qualification,
    currentDate: Dayjs
  ) {
    if (endDate) {
      return DateUtils.isDatePartBeforeOrEqual(currentDate, endDate);
    } else if (beginDate) {
      return true;
    } else {
      return false;
    }
  }

  static isQualificationExpired(
    { endDate }: Qualification,
    currentDate: Dayjs
  ) {
    return endDate && !DateUtils.isDatePartBeforeOrEqual(currentDate, endDate);
  }

  static groupClerkInterpreterAuthorisationsByStatus(
    clerkInterpreter: ClerkInterpreter
  ) {
    return clerkInterpreter.qualifications.reduce(
      (group: QualificationsGroupedByStatus, qualification: Qualification) => {
        const status = QualificationUtils.getQualificationStatus(qualification);
        group[status].push(qualification);

        return group;
      },
      { effective: [], expired: [] }
    );
  }

  static getKoodistoLangKeys() {
    return Object.keys(koodistoLangsFI?.akt?.koodisto?.languages);
  }

  private static getQualificationStatus(qualification: Qualification) {
    const currentDate = dayjs();
    let status!: QualificationStatus;

    if (
      QualificationUtils.isQualificationEffective(qualification, currentDate)
    ) {
      status = QualificationStatus.Effective;
    } else {
      status = QualificationStatus.Expired;
    }

    return status;
  }
}
