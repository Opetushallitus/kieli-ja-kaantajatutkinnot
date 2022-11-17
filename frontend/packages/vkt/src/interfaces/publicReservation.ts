import { Dayjs } from 'dayjs';

import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';

export interface PublicReservation
  extends Omit<PublicReservationResponse, 'expiresAt' | 'examEvent'> {
  expiresAt: Dayjs;
  examEvent: PublicExamEvent;
}

export interface PublicReservationResponse {
  id: number;
  expiresAt: string;
  examEvent: PublicExamEventResponse;
  person: PublicPerson;
}
