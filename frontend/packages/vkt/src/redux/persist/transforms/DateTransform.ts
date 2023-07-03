import { createTransform } from 'reduxjs-toolkit-persist';

import { PublicReservationResponse } from 'interfaces/publicEnrollment';
import { PublicExamEventResponse } from 'interfaces/publicExamEvent';
import { PublicEnrollmentState } from 'redux/reducers/publicEnrollment';
import { SerializationUtils } from 'utils/serialization';

interface OutboundState
  extends Omit<
    PublicEnrollmentState,
    'selectedExamEvent' | 'reservationDetails'
  > {
  selectedExamEvent: PublicExamEventResponse;
  reservationDetails: PublicReservationResponse;
}

export const DateTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: PublicEnrollmentState) => {
    return inboundState;
  },
  // transform state being rehydrated
  (outboundState: OutboundState) => ({
    ...outboundState,
    selectedExamEvent: SerializationUtils.deserializePublicExamEvent(
      outboundState.selectedExamEvent
    ),
    reservationDetails: SerializationUtils.deserializePublicReservation(
      outboundState.reservationDetails
    ),
  }),
  // define which reducers this transform gets called for.
  { whitelist: ['publicEnrollment'] }
);
