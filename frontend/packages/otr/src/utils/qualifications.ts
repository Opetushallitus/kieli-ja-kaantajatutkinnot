import dayjs, { Dayjs } from 'dayjs';
import { DateUtils } from 'shared/utils';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import {
  Qualification,
  QualificationsGroupedByStatus,
} from 'interfaces/qualification';

export class QualificationUtils {
  static isQualificationEffective(
    { beginDate, endDate }: Qualification,
    currentDate: Dayjs
  ) {
    return (
      DateUtils.isDatePartBeforeOrEqual(beginDate, currentDate) &&
      DateUtils.isDatePartBeforeOrEqual(currentDate, endDate)
    );
  }

  static isQualificationExpired(
    { endDate }: Qualification,
    currentDate: Dayjs
  ) {
    return !DateUtils.isDatePartBeforeOrEqual(currentDate, endDate);
  }

  static groupClerkInterpreterQualificationsByStatus(
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
