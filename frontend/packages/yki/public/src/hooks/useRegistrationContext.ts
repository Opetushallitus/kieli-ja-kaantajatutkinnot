import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationStates } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import {
  fetchRegistrationDetails,
  setActiveStep,
} from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';

export const useRegistrationContext = (
  examSessionId: number,
  registrationId: number,
  identify = false,
) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    context,
    requestedRegistration,
    fetchRegistrationStatus,
    initRegistration,
  } = useAppSelector(registrationSelector);
  const { status: sessionStatus, loggedInSession } =
    useAppSelector(sessionSelector);
  const matches =
    context?.exam_session.id === examSessionId &&
    context?.registration_id === registrationId;
  const requested =
    requestedRegistration?.examSessionId === examSessionId &&
    requestedRegistration?.registrationId === registrationId;
  const needsSession = matches && context?.state === RegistrationStates.Started;
  const failed =
    (requested && fetchRegistrationStatus === APIResponseStatus.Error) ||
    (needsSession && sessionStatus === APIResponseStatus.Error);

  useEffect(() => {
    if (
      !examSessionId ||
      !registrationId ||
      !Number.isFinite(examSessionId) ||
      !Number.isFinite(registrationId)
    ) {
      navigate(AppRoutes.Registration, { replace: true });
    } else if (!matches && !requested) {
      dispatch(fetchRegistrationDetails({ examSessionId, registrationId }));
    }
  }, [dispatch, examSessionId, registrationId, matches, requested, navigate]);

  useEffect(() => {
    if (
      !matches ||
      !context ||
      (needsSession && sessionStatus !== APIResponseStatus.Success)
    )
      return;
    const finished = context.state === RegistrationStates.Completed;
    const submitted = context.state === RegistrationStates.Submitted;
    if (
      !identify &&
      needsSession &&
      !loggedInSession &&
      initRegistration.status !== APIResponseStatus.Error
    ) {
      navigate(
        `${AppRoutes.ExamSession.replace(':examSessionId', String(examSessionId))}?registrationId=${registrationId}`,
        { replace: true },
      );

      return;
    }
    dispatch(
      setActiveStep(
        finished
          ? PublicRegistrationFormStep.Done
          : identify && !submitted
            ? PublicRegistrationFormStep.Identify
            : PublicRegistrationFormStep.Register,
      ),
    );
    if (identify && (finished || submitted)) {
      navigate(
        AppRoutes.ExamSessionRegistration.replace(
          ':examSessionId',
          String(examSessionId),
        ).replace(':registrationId', String(registrationId)),
        { replace: true },
      );
    }
  }, [
    context,
    dispatch,
    examSessionId,
    registrationId,
    matches,
    identify,
    navigate,
    initRegistration.status,
    needsSession,
    sessionStatus,
    loggedInSession,
  ]);

  return {
    isLoading:
      fetchRegistrationStatus === APIResponseStatus.InProgress ||
      (!matches && !failed) ||
      (needsSession &&
        [APIResponseStatus.NotStarted, APIResponseStatus.InProgress].includes(
          sessionStatus,
        )),
    failed,
  };
};
