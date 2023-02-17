import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  ClerkEnrollment,
  ClerkEnrollmentResponse,
} from 'interfaces/clerkEnrollment';
import {
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import {
  ClerkListExamEvent,
  ClerkListExamEventResponse,
} from 'interfaces/clerkListExamEvent';
import {
  PublicReservation,
  PublicReservationDetails,
  PublicReservationDetailsResponse,
  PublicReservationResponse,
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

    const reservation =
      reservationDetails.reservation &&
      SerializationUtils.deserializeReservation(reservationDetails.reservation);

    return {
      ...reservationDetails,
      examEvent,
      reservation,
    };
  }
  static deserializeReservation(
    reservation: PublicReservationResponse
  ): PublicReservation {
    return {
      ...reservation,
      expiresAt: dayjs(reservation.expiresAt),
      renewedAt: DateUtils.optionalStringToDate(reservation.renewedAt),
      createdAt: dayjs(reservation.createdAt),
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
    return {
      ...enrollment,
      enrollmentTime: dayjs(enrollment.enrollmentTime),
    };
  }

  static serializeClerkEnrollment(enrollment: ClerkEnrollment) {
    return {
      ...enrollment,
      enrollmentTime: DateUtils.serializeDate(enrollment.enrollmentTime),
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
