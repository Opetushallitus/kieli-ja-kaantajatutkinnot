import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  ClerkEnrollment,
  ClerkEnrollmentResponse,
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import {
  ClerkListExamEvent,
  ClerkListExamEventResponse,
} from 'interfaces/clerkListExamEvent';
import {
  PublicReservationDetails,
  PublicReservationDetailsResponse,
} from 'interfaces/publicEnrollment';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';

export class SerializationUtils {
  static deserializePublicExamEvent(
    publicExamEvent: PublicExamEventResponse
  ): PublicExamEvent {
    return {
      ...publicExamEvent,
      date: dayjs(publicExamEvent.date),
      registrationCloses: dayjs(publicExamEvent.registrationCloses),
    };
  }

  static deserializePublicReservationDetails(
    reservationDetails: PublicReservationDetailsResponse
  ): PublicReservationDetails {
    const examEvent = SerializationUtils.deserializePublicExamEvent(
      reservationDetails.examEvent
    );

    const reservation = reservationDetails.reservation && {
      ...reservationDetails.reservation,
      expiresAt: dayjs(reservationDetails.reservation.expiresAt),
    };

    return {
      ...reservationDetails,
      examEvent,
      reservation,
    };
  }

  static deserializeClerkListExamEvent(
    listExamEvent: ClerkListExamEventResponse
  ): ClerkListExamEvent {
    return {
      ...listExamEvent,
      date: dayjs(listExamEvent.date),
      registrationCloses: dayjs(listExamEvent.registrationCloses),
    };
  }

  static deserializeClerkEnrollment(enrollment: ClerkEnrollmentResponse) {
    const previousEnrollmentDate = enrollment.previousEnrollmentDate
      ? dayjs(enrollment.previousEnrollmentDate)
      : undefined;

    return {
      ...enrollment,
      enrollmentTime: dayjs(enrollment.enrollmentTime),
      previousEnrollmentDate,
    };
  }

  static serializeClerkEnrollment(enrollment: ClerkEnrollment) {
    return {
      ...enrollment,
      enrollmentTime: DateUtils.serializeDate(enrollment.enrollmentTime),
      previousEnrollmentDate: DateUtils.serializeDate(
        enrollment.previousEnrollmentDate
      ),
    };
  }

  static deserializeClerkExamEvent(
    examEvent: ClerkExamEventResponse
  ): ClerkExamEvent {
    return {
      ...examEvent,
      date: dayjs(examEvent.date),
      registrationCloses: dayjs(examEvent.registrationCloses),
      enrollments: examEvent.enrollments.map(
        SerializationUtils.deserializeClerkEnrollment
      ),
    };
  }

  static serializeNewClerkExamEvent(examEvent: ClerkExamEvent) {
    return {
      ...examEvent,
      date: DateUtils.serializeDate(examEvent.date),
      registrationCloses: DateUtils.serializeDate(examEvent.registrationCloses),
    };
  }

  static serializeClerkExamEvent(examEvent: ClerkExamEvent) {
    return {
      ...examEvent,
      date: DateUtils.serializeDate(examEvent.date),
      registrationCloses: DateUtils.serializeDate(examEvent.registrationCloses),
      enrollments: examEvent.enrollments.map(
        SerializationUtils.serializeClerkEnrollment
      ),
    };
  }
}
