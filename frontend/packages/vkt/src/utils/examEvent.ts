import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import { EnrollmentStatus, ExamLanguage, ExamLevel } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { ClerkExamEvent } from 'interfaces/clerkExamEvent';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export class ExamEventUtils {
  static getIsExamEventWithUnusedSeats(examEventDetails: ClerkExamEvent) {
    const participationStatuses = [
      EnrollmentStatus.COMPLETED,
      EnrollmentStatus.AWAITING_PAYMENT,
      EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT,
    ];
    const { enrollments } = examEventDetails;
    const participantsNumber = enrollments
      .map((e: ClerkEnrollment) => e.status)
      .filter((s: EnrollmentStatus) =>
        participationStatuses.includes(s),
      ).length;
    const isSeatsAvailable =
      examEventDetails.maxParticipants > participantsNumber;
    const isQueue = !!enrollments.find(
      (e: ClerkEnrollment) => e.status === EnrollmentStatus.QUEUED,
    );

    return isSeatsAvailable && isQueue;
  }

  static getUpcomingExamEvents(examEvents: Array<ClerkListExamEvent>) {
    return examEvents.filter(
      (e) => !DateUtils.isDatePartBefore(e.date, dayjs()),
    );
  }

  static getPassedExamEvents(examEvents: Array<ClerkListExamEvent>) {
    return examEvents.filter((e) =>
      DateUtils.isDatePartBefore(e.date, dayjs()),
    );
  }

  static hasOpenings(examEvent: PublicExamEvent) {
    return examEvent.openings > 0;
  }

  static languageAndLevelText(
    language: ExamLanguage,
    level: ExamLevel,
    translateCommon: (t: string) => string,
  ) {
    const langTranslation = translateCommon(`examLanguage.${language}`);
    const levelTranslation = translateCommon(
      `examLevel.${level}`,
    ).toLowerCase();

    return `${langTranslation}, ${levelTranslation}`;
  }
}
