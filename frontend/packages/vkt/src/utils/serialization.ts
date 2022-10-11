import dayjs from 'dayjs';

import {
  ClerkListExamEvent,
  ClerkListExamEventResponse,
} from 'interfaces/clerkListExamEvent';
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
