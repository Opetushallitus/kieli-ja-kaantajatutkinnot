import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { ClerkInterpreterDetails } from 'components/clerkInterpreter/overview/ClerkInterpreterDetails';
import { QualificationDetails } from 'components/clerkInterpreter/overview/QualificationDetails';
import { TopControls } from 'components/clerkInterpreter/overview/TopControls';
import { ClerkInterpreterOverviewPageSkeleton } from 'components/skeletons/ClerkInterpreterOverviewPageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  loadClerkInterpreterOverview,
  resetClerkInterpreterOverview,
} from 'redux/reducers/clerkInterpreterOverview';
import { showNotifierToast } from 'redux/reducers/notifier';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { NotifierUtils } from 'utils/notifier';

export const ClerkInterpreterOverviewPage = () => {
  // i18n
  const { t } = useAppTranslation({ keyPrefix: 'otr' });
  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, interpreter } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  const selectedInterpreterId = interpreter?.id;
  // React Router
  const navigate = useNavigate();
  const params = useParams();

  const isLoading =
    overviewStatus === APIResponseStatus.InProgress || !selectedInterpreterId;

  useEffect(() => {
    if (
      overviewStatus === APIResponseStatus.NotStarted &&
      !selectedInterpreterId &&
      params.interpreterId
    ) {
      // Fetch Interpreter overview
      dispatch(loadClerkInterpreterOverview({ id: +params.interpreterId }));
    } else if (
      overviewStatus === APIResponseStatus.Error ||
      !Number(params.interpreterId)
    ) {
      // Show an error
      const toast = NotifierUtils.createNotifierToast(
        Severity.Error,
        t('pages.clerkInterpreterOverviewPage.toasts.notFound')
      );
      dispatch(showNotifierToast(toast));
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [
    overviewStatus,
    dispatch,
    navigate,
    params.interpreterId,
    selectedInterpreterId,
    t,
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkInterpreterOverview());
    };
  }, [dispatch]);

  return (
    <Box className="clerk-interpreter-overview-page">
      <H1>{t('pages.clerkInterpreterOverviewPage.title')}</H1>
      <Paper
        elevation={3}
        className="clerk-interpreter-overview-page__content-container rows"
      >
        {isLoading ? (
          <ClerkInterpreterOverviewPageSkeleton />
        ) : (
          <>
            <TopControls />
            <div className="rows gapped">
              <ClerkInterpreterDetails />
              <QualificationDetails />
            </div>
          </>
        )}
      </Paper>
    </Box>
  );
};
