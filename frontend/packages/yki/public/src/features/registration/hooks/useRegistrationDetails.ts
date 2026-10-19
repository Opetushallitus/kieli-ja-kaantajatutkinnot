import { useEffect } from 'react';
import { APIResponseStatus } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { resetExamSession } from 'features/registration/redux/reducers/examSession';
import { resetKoskiEducations } from 'features/registration/redux/reducers/publicEducation';
import { resetPublicFreeRegistration } from 'features/registration/redux/reducers/publicFreeRegistration';
import { resetPublicIdentificationState } from 'features/registration/redux/reducers/publicIdentification';
import {
  fetchRegistrationDetails,
  rejectRegistrationDetails,
  resetPublicRegistration,
  setActiveStep,
} from 'features/registration/redux/reducers/registration';
import { registrationSelector } from 'features/registration/redux/selectors/registration';

// Each page entry, including a refresh or an authentication return, gets its
// registration and exam session from the same backend response.
export const useRegistrationDetails = (
  examSessionId: number,
  registrationId: number,
  step: PublicRegistrationFormStep,
) => {
  const dispatch = useAppDispatch();
  const { registration, fetchRegistration } =
    useAppSelector(registrationSelector);
  const validIds =
    Number.isSafeInteger(examSessionId) &&
    examSessionId > 0 &&
    Number.isSafeInteger(registrationId) &&
    registrationId > 0;

  useEffect(() => {
    dispatch(resetPublicRegistration());
    dispatch(resetExamSession());
    dispatch(resetPublicFreeRegistration());
    dispatch(resetKoskiEducations());
    dispatch(resetPublicIdentificationState());
    dispatch(setActiveStep(step));
    if (validIds) {
      dispatch(fetchRegistrationDetails({ examSessionId, registrationId }));
    } else {
      dispatch(rejectRegistrationDetails());
    }
  }, [dispatch, examSessionId, registrationId, step, validIds]);

  return {
    isLoading:
      fetchRegistration.status === APIResponseStatus.NotStarted ||
      fetchRegistration.status === APIResponseStatus.InProgress ||
      (validIds &&
        (registration.examSessionId !== examSessionId ||
          registration.id !== registrationId)),
    isError: fetchRegistration.status === APIResponseStatus.Error,
  };
};
