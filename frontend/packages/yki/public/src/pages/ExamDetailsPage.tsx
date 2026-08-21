import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { loadExamSession } from 'redux/reducers/examSession';
import {
  acceptPublicRegistrationSubmission,
  fetchRegistrationDetails,
  identifyRegistration,
  setActiveStep,
} from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';

export const ExamDetailsPage = ({
  registrationKind,
}: {
  registrationKind: RegistrationKind;
}) => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.examDetailsPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status: sessionStatus } = useAppSelector(sessionSelector);
  const { status, examSession } = useAppSelector(examSessionSelector);
  const { initRegistration, fetchRegistrationStatus, submitRegistration } =
    useAppSelector(registrationSelector);
  // React Router
  const params = useParams();
  const [searchParams] = useSearchParams();

  const isLoading =
    sessionStatus === APIResponseStatus.NotStarted ||
    sessionStatus === APIResponseStatus.InProgress ||
    status === APIResponseStatus.InProgress ||
    fetchRegistrationStatus === APIResponseStatus.InProgress ||
    initRegistration.status === APIResponseStatus.InProgress;

  useEffect(() => {
    dispatch(setActiveStep(PublicRegistrationFormStep.Register));
  }, [dispatch]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      !examSession?.id &&
      params.examSessionId &&
      params.registrationId
    ) {
      dispatch(loadExamSession(+params.examSessionId));
    } else if (
      status === APIResponseStatus.Error ||
      isNaN(Number(params.examSessionId))
    ) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });
    }
  }, [
    status,
    dispatch,
    params.examSessionId,
    params.registrationId,
    showToast,
    examSession?.id,
    t,
  ]);

  useEffect(() => {
    if (
      !searchParams.get('submitted') ||
      status !== APIResponseStatus.Success ||
      !examSession?.id ||
      !params.examSessionId ||
      !params.registrationId ||
      initRegistration.status !== APIResponseStatus.NotStarted ||
      submitRegistration.status !== APIResponseStatus.NotStarted ||
      examSession.id !== +params.examSessionId
    ) {
      return;
    }

    const code = searchParams.get('code');
    const queue = searchParams.get('queue');
    const registration_kind =
      queue === 'true' ? RegistrationKind.Queue : RegistrationKind.Admission;

    dispatch(fetchRegistrationDetails(+params.registrationId));
    dispatch(
      acceptPublicRegistrationSubmission({
        code: code || '',
        registration_kind,
        state: RegistrationStates.Submitted,
      }),
    );
  }, [
    dispatch,
    examSession?.id,
    initRegistration.status,
    params.examSessionId,
    params.registrationId,
    searchParams,
    status,
    submitRegistration.status,
  ]);

  useEffect(() => {
    if (
      searchParams.get('submitted') ||
      sessionStatus !== APIResponseStatus.Success ||
      status !== APIResponseStatus.Success ||
      !examSession?.id ||
      !params.examSessionId ||
      !params.registrationId ||
      initRegistration.status !== APIResponseStatus.NotStarted ||
      examSession.id !== +params.examSessionId
    ) {
      return;
    }

    // Else attempt to initiate registration.
    dispatch(
      identifyRegistration({
        examSessionId: +params.examSessionId,
        // TODO registrationKind not needed when calling /identify, refactor away!
        registrationKind: RegistrationKind.Admission,
        registrationId: +params.registrationId,
      }),
    );
  }, [
    dispatch,
    examSession?.id,
    initRegistration.status,
    params.examSessionId,
    params.registrationId,
    registrationKind,
    searchParams,
    sessionStatus,
    status,
  ]);

  return (
    <Box className="public-exam-details-page">
      {isLoading ? (
        <PublicExamDetailsPageSkeleton />
      ) : (
        <>
          <div className="rows gapped">
            <PublicRegistrationGrid />
          </div>
        </>
      )}
    </Box>
  );
};
