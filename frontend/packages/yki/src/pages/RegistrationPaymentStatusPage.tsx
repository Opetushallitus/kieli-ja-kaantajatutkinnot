import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { loadExamSession } from 'redux/reducers/examSession';
import { setActiveStep } from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';

export const RegistrationPaymentStatusPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationStatusPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  // React Router
  const [params] = useSearchParams();
  const examSessionId = params.get('id');

  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    dispatch(setActiveStep(PublicRegistrationFormStep.Payment));
  }, [dispatch]);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted && examSessionId) {
      // Fetch exam details
      dispatch(loadExamSession(+examSessionId));
    } else if (
      status === APIResponseStatus.Error ||
      !examSessionId ||
      isNaN(Number(examSessionId))
    ) {
      // Show an error
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });
    }
  }, [status, dispatch, showToast, examSession?.id, t, examSessionId]);

  return (
    <Box className="registration-payment-status-page">
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
