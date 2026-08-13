import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  fetchRegistrationDetails,
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
  const {
    activeStep,
    initRegistration: initRegistrationState,
    fetchRegistrationStatus,
  } = useAppSelector(registrationSelector);
  // React Router
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

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

  const registrationIdParam = searchParams.get('registrationId');
  const registrationIdFromParams = registrationIdParam
    ? Number(registrationIdParam)
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
    if (!examSession) {
      return;
    }

    const alreadyInitializedForSession =
      initRegistrationState.status === APIResponseStatus.Success &&
      initRegistrationState.examSessionId === idFromParams;

    if (alreadyInitializedForSession) {
      return;
    }

    if (registrationIdFromParams) {
      // On refresh or direct navigation the frontend no longer knows the selected
      // partial exam type, so let the backend dictate the registration state
      // (kind and partial exam type) by fetching the existing registration.
      if (fetchRegistrationStatus === APIResponseStatus.NotStarted) {
        dispatch(fetchRegistrationDetails(registrationIdFromParams));
      }
    } else if (initRegistrationState.partialExamType) {
      // First-time in-app flow where the selected partial exam type is known.
      dispatch(
        initRegistration({
          examSessionId: examSession.id,
          registrationKind: examSession.available_registration_kind,
          partialExamType: initRegistrationState.partialExamType,
        }),
      );
    } else {
      // Without a registration reference or a known partial exam type there is
      // nothing to resume; send the user back to the exam session listing.
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });

      navigate(AppRoutes.Registration, { replace: true });
    }
  }, [
    dispatch,
    navigate,
    showToast,
    t,
    idFromParams,
    examSession,
    fetchRegistrationStatus,
    registrationIdFromParams,
    initRegistrationState.status,
    initRegistrationState.examSessionId,
    initRegistrationState.partialExamType,
  ]);

  useEffect(() => {
    if (fetchRegistrationStatus === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });

      navigate(AppRoutes.Registration, { replace: true });
    }
  }, [fetchRegistrationStatus, navigate, showToast, t]);

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
