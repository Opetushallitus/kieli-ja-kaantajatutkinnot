import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicIdentificationGrid } from 'components/registration/PublicIdentificationGrid';
import { PublicIdentificationPageSkeleton } from 'components/skeletons/PublicIdentificationPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadExamSession } from 'redux/reducers/examSession';
import { examSessionSelector } from 'redux/selectors/examSession';

export const IdentifyPage = () => {
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

  useEffect(() => {
    return () => {
      // TODO: Reset fields on unmount
      // dispatch(resetClerkTranslatorOverview());
    };
  }, [dispatch]);

  return (
    <Box className="public-exam-details-page">
      <Paper
        elevation={3}
        className="public-exam-details-page__content-container rows"
      >
        {isLoading ? (
          <PublicIdentificationPageSkeleton />
        ) : (
          <>
            <div className="rows gapped">
              <PublicIdentificationGrid />
            </div>
          </>
        )}
      </Paper>
    </Box>
  );
};
