import { Dayjs } from 'dayjs';

import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { PublicPerson } from 'interfaces/publicPerson';

export interface PublicReservation
  extends Omit<PublicReservationResponse, 'expiresAt'> {
  expiresAt: Dayjs;
}

export interface PublicReservationResponse {
  id: number;
  expiresAt: string;
  examEvent: PublicExamEvent;
  person: PublicPerson;
}
