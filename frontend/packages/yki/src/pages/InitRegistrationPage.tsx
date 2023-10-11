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
import { setActiveStep } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

const ContentSelector = () => {
  const examSession = useAppSelector(examSessionSelector).examSession;
  if (!examSession) {
    return null;
  }
  const { open, availablePlaces } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  if (!open || !availablePlaces) {
    return <RegistrationNotAvailable />;
  } else {
    return <PublicIdentificationGrid />;
  }
};

const InitRegistrationPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.initRegistrationPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  const { activeStep } = useAppSelector(registrationSelector);
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
    };
  }, [dispatch, activeStep]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      !examSession?.id &&
      params.examSessionId
    ) {
      // Fetch exam details
      dispatch(loadExamSession(+params.examSessionId));
    } else if (
      status === APIResponseStatus.Error ||
      isNaN(Number(params.examSessionId))
    ) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });

      navigate(AppRoutes.Registration, { replace: true });
    }
  }, [
    status,
    dispatch,
    navigate,
    params.examSessionId,
    showToast,
    examSession?.id,
    t,
  ]);

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

export default InitRegistrationPage;
