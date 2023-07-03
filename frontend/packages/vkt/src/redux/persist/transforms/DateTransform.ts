import { createTransform } from 'reduxjs-toolkit-persist';

import { PublicReservationResponse } from 'interfaces/publicEnrollment';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import { PublicEnrollmentState } from 'redux/reducers/publicEnrollment';
import { SerializationUtils } from 'utils/serialization';

interface OutboundState
  extends Omit<PublicEnrollmentState, 'examEvent' | 'reservation'> {
  examEvent: PublicExamEventResponse;
  reservation: PublicReservationResponse;
}

export const DateTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: PublicEnrollmentState) => {
    return inboundState;
  },
  // transform state being rehydrated
  (outboundState: OutboundState) => ({
    ...outboundState,
    examEvent: SerializationUtils.deserializePublicExamEvent(
      outboundState.examEvent
    ),
    reservation: SerializationUtils.deserializePublicReservation(
      outboundState.reservation
    ),
  }),
  // define which reducers this transform gets called for.
  { whitelist: ['publicEnrollment'] }
);
