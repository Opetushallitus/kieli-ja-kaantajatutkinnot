import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus, Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

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
import { resetQualificationState } from 'redux/reducers/qualification';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { qualificationSelector } from 'redux/selectors/qualification';

export const ClerkInterpreterOverviewPage = () => {
  // i18n
  const { t } = useAppTranslation({ keyPrefix: 'otr' });
  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, interpreter } = useAppSelector(
    clerkInterpreterOverviewSelector
  );
  const { addStatus } = useAppSelector(qualificationSelector);

  const { showToast } = useToast();

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
      dispatch(loadClerkInterpreterOverview(+params.interpreterId));
    } else if (
      overviewStatus === APIResponseStatus.Error ||
      isNaN(Number(params.interpreterId))
    ) {
      showToast({
        severity: Severity.Error,
        description: t('pages.clerkInterpreterOverviewPage.toasts.notFound'),
        timeOut: Duration.Short,
      });
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [
    overviewStatus,
    dispatch,
    navigate,
    showToast,
    params.interpreterId,
    selectedInterpreterId,
    t,
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetQualificationState());
      dispatch(resetClerkInterpreterOverview());
    };
  }, [dispatch]);

  useEffect(() => {
    if (addStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('component.newQualification.toasts.success'),
        timeOut: Duration.Short,
      });
      dispatch(resetQualificationState());
    }
  }, [addStatus, showToast, dispatch, t]);

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
