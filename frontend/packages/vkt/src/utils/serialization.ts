import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  ClerkExamEvent,
  ClerkExamEventEnrollmentResponse,
  ClerkExamEventResponse,
  Enrollment,
} from 'interfaces/clerkExamEvent';
import {
  ClerkListExamEvent,
  ClerkListExamEventResponse,
} from 'interfaces/clerkListExamEvent';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import {
  PublicReservation,
  PublicReservationResponse,
} from 'interfaces/publicReservation';

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

  static deserializePublicReservation(
    publicReservation: PublicReservationResponse
  ): PublicReservation {
    return {
      ...publicReservation,
      expiresAt: dayjs(publicReservation.expiresAt),
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

  static deserializeEnrollments(
    response: Array<ClerkExamEventEnrollmentResponse>
  ) {
    return response.map(SerializationUtils.deserializeEnrollment);
  }

  static deserializeEnrollment(enrollment: ClerkExamEventEnrollmentResponse) {
    return {
      ...enrollment,
      previousEnrollmentDate: dayjs(enrollment.previousEnrollmentDate),
    };
  }

  static serializeEnrollments(response: Array<Enrollment>) {
    return response.map(SerializationUtils.serializeEnrollment);
  }

  static serializeEnrollment(enrollment: Enrollment) {
    return {
      ...enrollment,
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
      enrollments: SerializationUtils.deserializeEnrollments(
        examEvent.enrollments
      ),
    };
  }

  static serializeClerkExamEvent(examEvent: ClerkExamEvent) {
    return {
      ...examEvent,
      date: DateUtils.serializeDate(examEvent.date),
      registrationCloses: DateUtils.serializeDate(examEvent.registrationCloses),
      enrollments: SerializationUtils.serializeEnrollments(
        examEvent.enrollments
      ),
    };
  }
}
