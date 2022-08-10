import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus, Duration, Severity } from 'shared/enums';

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
import { resetQualification } from 'redux/reducers/qualification';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { qualificationSelector } from 'redux/selectors/qualification';
import { NotifierUtils } from 'utils/notifier';

export const ClerkInterpreterOverviewPage = () => {
  // i18n
  const { t } = useAppTranslation({ keyPrefix: 'otr' });
  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, interpreter } = useAppSelector(
    clerkInterpreterOverviewSelector
  );
  const { status: addQualificationStatus } = useAppSelector(
    qualificationSelector
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
        t('pages.clerkInterpreterOverviewPage.toasts.notFound'),
        Duration.Short
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
      dispatch(resetQualification());
      dispatch(resetClerkInterpreterOverview());
    };
  }, [dispatch]);

  useEffect(() => {
    if (addQualificationStatus === APIResponseStatus.Success) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Success,
        t('component.clerkInterpreterOverview.toasts.updated'),
        Duration.Short
      );
      dispatch(showNotifierToast(toast));
    } else if (addQualificationStatus === APIResponseStatus.Error) {
      const toast = NotifierUtils.createNotifierToast(
        Severity.Error,
        t('component.clerkInterpreterOverview.toasts.updateFailed'),
        Duration.Short
      );
      dispatch(showNotifierToast(toast));
    }
  }, [addQualificationStatus, dispatch, t]);

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
