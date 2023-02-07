import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicRegistrationGrid } from 'components/registration/PublicRegistrationGrid';
import { PublicExamDetailsPageSkeleton } from 'components/skeletons/PublicExamDetailsPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadExamSession } from 'redux/reducers/examSession';
import { examSessionSelector } from 'redux/selectors/examSession';

export const ExamDetailsPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.examDetailsPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const { status, examSession } = useAppSelector(examSessionSelector);
  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const isLoading = status === APIResponseStatus.InProgress;

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
      // Show an error
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
      <Paper
        elevation={3}
        className="public-exam-details-page__content-container rows"
      >
        {isLoading ? (
          <PublicExamDetailsPageSkeleton />
        ) : (
          <>
            <div className="rows gapped">
              <PublicRegistrationGrid />
            </div>
          </>
        )}
      </Paper>
    </Box>
  );
};
