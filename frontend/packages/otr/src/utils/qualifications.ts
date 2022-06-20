import dayjs, { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import {
  Qualification,
  QualificationsGroupedByStatus,
} from 'interfaces/qualification';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';

const EXPIRING_QUALIFICATION_THRESHOLD_MONTHS = 3;

export class QualificationUtils {
  static getKoodistoLangKeys() {
    return Object.keys(koodistoLangsFI?.otr?.koodisto?.languages);
  }

  static isQualificationEffective(
    { beginDate, endDate }: Qualification,
    currentDate: Dayjs
  ) {
    return (
      DateUtils.isDatePartBeforeOrEqual(beginDate, currentDate) &&
      DateUtils.isDatePartBeforeOrEqual(currentDate, endDate)
    );
  }

  static isQualificationExpiring(
    { beginDate, endDate }: Qualification,
    currentDate: Dayjs
  ) {
    return (
      DateUtils.isDatePartBeforeOrEqual(beginDate, currentDate) &&
      DateUtils.isDatePartBeforeOrEqual(
        endDate.add(EXPIRING_QUALIFICATION_THRESHOLD_MONTHS, 'month'),
        currentDate
      )
    );
  }

  static isQualificationExpired(
    { endDate }: Qualification,
    currentDate: Dayjs
  ) {
    return !DateUtils.isDatePartBeforeOrEqual(currentDate, endDate);
  }

  static getQualificationsByStatus(clerkInterpreter: ClerkInterpreter) {
    const currentDate = dayjs();

    return clerkInterpreter.qualifications.reduce(
      (group: QualificationsGroupedByStatus, qualification: Qualification) => {
        if (
          QualificationUtils.isQualificationEffective(
            qualification,
            currentDate
          )
        ) {
          group[QualificationStatus.Effective].push(qualification);
          if (
            QualificationUtils.isQualificationExpiring(
              qualification,
              currentDate
            )
          ) {
            group[QualificationStatus.Expiring].push(qualification);
          }
        } else {
          // Note: taking the else branch without further comparisons
          // relies on the assumption that there is no qualification
          // with a begin date set to future.
          group[QualificationStatus.Expired].push(qualification);
        }

        return group;
      },
      { effective: [], expired: [], expiring: [] }
    );
  }
}
