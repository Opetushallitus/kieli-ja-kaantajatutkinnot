import { createTransform } from 'reduxjs-toolkit-persist';

import {
  initialState,
  PublicEnrollmentContactState,
} from 'redux/reducers/publicEnrollmentContact';

type OutboundState = PublicEnrollmentContactState;

export const PublicEnrollmentContactTransform = createTransform(
  // transform state on its way to being serialized and persisted:
  // retain details provided by user (enrollment details) as well as important inferred details (contacted examiners),
  // discard rest
  (
    inboundState: PublicEnrollmentContactState,
  ): Partial<PublicEnrollmentContactState> => {
    return {
      enrollment: inboundState.enrollment,
      contactedExaminers: inboundState.contactedExaminers,
    };
  },
  // transform state being rehydrated
  (outboundState: OutboundState) => {
    return {
      ...initialState,
      ...outboundState,
    };
  },
  // define which reducers this transform gets called for.
  { whitelist: ['publicEnrollmentContact'] },
);
