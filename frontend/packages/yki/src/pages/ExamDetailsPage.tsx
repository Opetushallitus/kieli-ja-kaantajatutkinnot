import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { loadExamSession } from 'redux/reducers/examSession';
import {
  acceptPublicRegistrationSubmission,
  initRegistration,
  setActiveStep,
} from 'redux/reducers/registration';
import { examSessionSelector } from 'redux/selectors/examSession';

const ExamDetailsPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.examDetailsPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  // React Router
  const params = useParams();
  const [searchParams] = useSearchParams();

  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    dispatch(setActiveStep(PublicRegistrationFormStep.Register));
  }, [dispatch]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      !examSession?.id &&
      params.examSessionId
    ) {
      if (searchParams.get('submitted')) {
        // If form is already submitted, just reload exam session details
        // and manually set registration status to submitted.
        dispatch(loadExamSession(+params.examSessionId));
        dispatch(acceptPublicRegistrationSubmission());
      } else {
        // Else attempt to initiate registration.
        dispatch(initRegistration(+params.examSessionId));
      }
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
  }, [
    status,
    dispatch,
    params.examSessionId,
    showToast,
    examSession?.id,
    t,
    searchParams,
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

export default ExamDetailsPage;
