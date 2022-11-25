import { Grid, Paper } from '@mui/material';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { ClerkExamEventListing } from 'components/clerkExamEvent/listing/ClerkExamEventListing';
import { PublicExamEventGridSkeleton } from 'components/skeletons/PublicExamEventGridSkeleton';
import { useClerkTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import {
  clerkListExamEventsSelector,
  selectFilteredClerkExamEvents,
} from 'redux/selectors/clerkListExamEvent';

export const ClerkExamCreateEvent = () => {
  // I18
  const { t } = useClerkTranslation({ keyPrefix: 'vkt.pages.homepage' });

  // Redux
  const { status } = useAppSelector(clerkListExamEventsSelector);
  const examEvents = useAppSelector(selectFilteredClerkExamEvents);

  // State
  const isLoading = status === APIResponseStatus.InProgress;

  return (
    <>
      <Grid item>
        <H1
          data-testid="clerk-homepage__title-heading"
          sx={{ marginBottom: 0 }}
        >
          {t('title')}
        </H1>
      </Grid>
      <Grid item>
        <Paper elevation={3} className="clerk-homepage__exam-events">
          {isLoading ? (
            <PublicExamEventGridSkeleton />
          ) : (
            <ClerkExamEventListing examEvents={examEvents} />
          )}
        </Paper>
      </Grid>
    </>
  );
};
