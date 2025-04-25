import { createTransform } from 'reduxjs-toolkit-persist';

import {
  initialState,
  PublicEnrollmentState,
} from 'redux/reducers/publicEnrollment';

type OutboundState = PublicEnrollmentState;

export const PublicEnrollmentTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: PublicEnrollmentState) => {
    return {
      enrollment: inboundState.enrollment,
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
  { whitelist: ['publicEnrollment'] },
);
