import { Box, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamEventListing } from 'components/clerkExamEvent/listing/ClerkExamEventListing';
import { ClerkExaminerListing } from 'components/clerkExaminer/ClerkExaminerListing';
import { PublicExamEventGridSkeleton } from 'components/skeletons/PublicExamEventGridSkeleton';
import { useClerkTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { resetClerkExamEventOverview } from 'redux/reducers/clerkExamEventOverview';
import { loadExamEvents } from 'redux/reducers/clerkListExamEvent';
import { loadClerkListExaminers } from 'redux/reducers/clerkListExaminer';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';
import { clerkListExaminerSelector } from 'redux/selectors/clerkListExaminer';

export const ClerkGoodAndSatisfactoryLevelPage: FC = () => {
  // I18
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.pages.goodAndSatisfactoryLevel',
  });

  const dispatch = useAppDispatch();
  const { status: examEventsStatus } = useAppSelector(
    clerkListExamEventsSelector,
  );
  const { status: examinerListStatus } = useAppSelector(
    clerkListExaminerSelector,
  );

  const examinersLoading = examinerListStatus === APIResponseStatus.InProgress;
  const examEventsLoading = examEventsStatus === APIResponseStatus.InProgress;

  useEffect(() => {
    if (examEventsStatus === APIResponseStatus.NotStarted) {
      dispatch(loadExamEvents());
    }
  }, [dispatch, examEventsStatus]);
  useEffect(() => {
    if (examinerListStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkListExaminers());
    }
  }, [dispatch, examinerListStatus]);

  useEffect(() => {
    dispatch(resetClerkExamEventOverview());
  }, [dispatch]);
  // TODO Listing of examiners
  // TODO Listing of exam events of good and satisfactory level

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <Grid item>
          <H1
            data-testid="clerk-homepage__title-heading"
            sx={{ marginBottom: 0 }}
          >
            {t('title')}
          </H1>
        </Grid>
        <Grid item>
          <Paper elevation={3} className="clerk-homepage__examiners">
            {examinersLoading ? (
              <PublicExamEventGridSkeleton />
            ) : (
              <ClerkExaminerListing />
            )}
            {examEventsLoading ? (
              <PublicExamEventGridSkeleton />
            ) : (
              <ClerkExamEventListing examEvents={[]} />
            )}
          </Paper>
        </Grid>{' '}
      </Grid>
    </Box>
  );
};
