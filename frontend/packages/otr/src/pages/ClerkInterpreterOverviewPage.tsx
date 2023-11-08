import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1 } from 'shared/components';
import { APIResponseStatus, Duration, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkInterpreterDetails } from 'components/clerkInterpreter/overview/ClerkInterpreterDetails';
import { QualificationDetails } from 'components/clerkInterpreter/overview/QualificationDetails';
import { BackButton } from 'components/common/BackButton';
import { ClerkInterpreterOverviewPageSkeleton } from 'components/skeletons/ClerkInterpreterOverviewPageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  loadClerkInterpreterOverview,
  resetClerkInterpreterOverview,
} from 'redux/reducers/clerkInterpreterOverview';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';

const ClerkInterpreterOverviewPage = () => {
  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.pages.clerkInterpreterOverviewPage',
  });
  // Redux
  const dispatch = useAppDispatch();
  const { overviewStatus, interpreter } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

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
        description: t('toasts.notFound'),
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
      dispatch(resetClerkInterpreterOverview());
    };
  }, [dispatch]);

  return (
    <Box className="clerk-interpreter-overview-page">
      <H1>{t('title')}</H1>
      <Paper
        elevation={3}
        className="clerk-interpreter-overview-page__content-container rows"
      >
        {isLoading ? (
          <ClerkInterpreterOverviewPageSkeleton />
        ) : (
          <>
            <BackButton />
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

export default ClerkInterpreterOverviewPage;
