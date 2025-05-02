import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicIdentificationGrid } from 'components/registration/PublicIdentificationGrid';
import { RegistrationNotAvailable } from 'components/registration/RegistrationNotAvailable';
import { PublicIdentificationPageSkeleton } from 'components/skeletons/PublicIdentificationPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { loadExamSession } from 'redux/reducers/examSession';
import { resetPublicIdentificationState } from 'redux/reducers/publicIdentification';
import {
  initRegistration,
  resetPublicRegistration,
  setActiveStep,
} from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

export const ContentSelector = () => {
  const examSession = useAppSelector(examSessionSelector).examSession;
  if (!examSession) {
    return null;
  }
  const { open } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  if (!open) {
    return <RegistrationNotAvailable />;
  } else {
    return <PublicIdentificationGrid />;
  }
};

export const InitRegistrationPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.initRegistrationPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();

  const { status, examSession } = useAppSelector(examSessionSelector);
  const { activeStep, initRegistration: initRegistrationState } =
    useAppSelector(registrationSelector);
  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    if (activeStep !== PublicRegistrationFormStep.Identify) {
      dispatch(setActiveStep(PublicRegistrationFormStep.Identify));
    }

    return () => {
      dispatch(resetPublicIdentificationState());
      dispatch(resetPublicRegistration());
    };
  }, [dispatch, activeStep]);

  const idFromParams = params.examSessionId
    ? Number(params.examSessionId)
    : undefined;

  useEffect(() => {
    if (
      (status === APIResponseStatus.NotStarted ||
        status === APIResponseStatus.Success) &&
      idFromParams &&
      examSession?.id !== idFromParams
    ) {
      // Fetch exam details
      dispatch(loadExamSession(idFromParams));
    } else if (
      status === APIResponseStatus.Error ||
      idFromParams === undefined ||
      isNaN(idFromParams)
    ) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });

      navigate(AppRoutes.Registration, { replace: true });
    }
  }, [status, dispatch, navigate, showToast, idFromParams, examSession?.id, t]);

  useEffect(() => {
    if (
      examSession &&
      (initRegistrationState.status === APIResponseStatus.NotStarted ||
        initRegistrationState.examSessionId !== idFromParams)
    ) {
      // Ensure registration init endpoint gets called, even if navigating to the page directly by URL.
      // This is necessary to accurately infer if user can enroll to exam proper or if they must enroll to queue instead.
      dispatch(
        initRegistration({
          examSessionId: examSession.id,
          registrationKind: examSession.available_registration_kind,
        }),
        [
          examSession,
          initRegistrationState.status,
          initRegistrationState.examSessionId,
        ],
      );
    }
  });

  useEffect(() => {
    if (
      examSession &&
      (initRegistrationState.status === APIResponseStatus.NotStarted ||
        initRegistrationState.examSessionId !== idFromParams)
    ) {
      // Ensure registration init endpoint gets called, even if navigating to the page directly by URL.
      // This is necessary to accurately infer if user can enroll to exam proper or if they must enroll to queue instead.
      dispatch(
        initRegistration({
          examSessionId: examSession.id,
          registrationKind: examSession.available_registration_kind,
        }),
        [
          examSession,
          initRegistrationState.status,
          initRegistrationState.examSessionId,
        ],
      );
    }
  });

  return (
    <Box className="public-exam-details-page">
      {isLoading ? (
        <PublicIdentificationPageSkeleton />
      ) : (
        <>
          <div className="rows gapped">
            <ContentSelector />
          </div>
        </>
      )}
    </Box>
  );
};
