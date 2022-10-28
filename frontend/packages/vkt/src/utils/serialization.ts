import dayjs from 'dayjs';

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
}
