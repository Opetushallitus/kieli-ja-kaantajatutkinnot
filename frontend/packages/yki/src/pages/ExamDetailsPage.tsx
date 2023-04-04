import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { initRegistration, setActiveStep } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';

export const ExamDetailsPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.examDetailsPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  const { activeStep } = useAppSelector(registrationSelector);
  // React Router
  const params = useParams();

  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    if (activeStep !== PublicRegistrationFormStep.Register) {
      dispatch(setActiveStep(PublicRegistrationFormStep.Register));
    }
  }, [dispatch, activeStep]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      !examSession?.id &&
      params.examSessionId
    ) {
      // Fetch exam details
      dispatch(initRegistration(+params.examSessionId));
    } else if (
      status === APIResponseStatus.Error ||
      isNaN(Number(params.examSessionId))
    ) {
      // Show an error
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });
    }
  }, [status, dispatch, params.examSessionId, showToast, examSession?.id, t]);

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
