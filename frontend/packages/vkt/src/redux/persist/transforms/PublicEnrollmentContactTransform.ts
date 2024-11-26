import { createTransform } from 'reduxjs-toolkit-persist';

import {
  initialState,
  PublicEnrollmentContactState,
} from 'redux/reducers/publicEnrollmentContact';

type OutboundState = PublicEnrollmentContactState;

export const PublicEnrollmentContactTransform = createTransform(
  // transform state on its way to being serialized and persisted:
  // retain details relevant for user experience, discard others
  ({
    enrollment,
    contactedExaminers,
    contactDetailsNeedConfirmation,
  }: PublicEnrollmentContactState): Partial<PublicEnrollmentContactState> => {
    return { enrollment, contactedExaminers, contactDetailsNeedConfirmation };
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
