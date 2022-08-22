import { Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { AddMeetingDate } from 'components/clerkTranslator/meetingDates/AddMeetingDate';
import { MeetingDatesListing } from 'components/clerkTranslator/meetingDates/MeetingDatesListing';
import { MeetingDatesToggleFilters } from 'components/clerkTranslator/meetingDates/MeetingDatesToggleFilters';
import { MeetingDatesPageSkeleton } from 'components/skeletons/MeetingDatesPageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  loadMeetingDates,
  resetMeetingDateAdd,
  resetMeetingDateRemove,
} from 'redux/reducers/meetingDate';
import { meetingDatesSelector } from 'redux/selectors/meetingDate';

export const MeetingDatesPage: FC = () => {
  const {
    meetingDates: { status, meetingDates },
    addMeetingDate: { status: addMeetingDateStatus },
    removeMeetingDate: { status: removeMeetingDateStatus },
  } = useAppSelector(meetingDatesSelector);
  const isLoading = status === APIResponseStatus.InProgress;
  const dispatch = useAppDispatch();

  const { t } = useAppTranslation({ keyPrefix: 'akr.pages' });
  const { showToast } = useToast();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadMeetingDates());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (addMeetingDateStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('meetingDatesPage.toasts.addingSucceeded'),
      });
    }

    return () => {
      dispatch(resetMeetingDateAdd());
    };
  }, [dispatch, addMeetingDateStatus, showToast, t]);

  useEffect(() => {
    if (removeMeetingDateStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('meetingDatesPage.toasts.removingSucceeded'),
      });
    }

    return () => {
      dispatch(resetMeetingDateRemove());
    };
  }, [dispatch, removeMeetingDateStatus, showToast, t]);

  const renderMeetingDatesPageGrids = () => (
    <>
      <Grid item>
        <div
          className="columns gapped"
          data-testid="meeting-dates-page__heading"
        >
          <H2>{t('meetingDatesPage.title')}</H2>
          <Text>{`(${meetingDates.length})`}</Text>
        </div>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid
        className="meeting-dates-page__grid-container__date-controls grow columns"
        item
      >
        <MeetingDatesToggleFilters />
      </Grid>
      <Grid item>
        <AddMeetingDate />
      </Grid>
      <Grid item>
        <MeetingDatesListing />
      </Grid>
    </>
  );

  return (
    <div className="meeting-dates-page">
      <H1>{t('clerkHomepage.title')}</H1>
      <Paper elevation={3}>
        <Grid
          container
          direction="column"
          className="meeting-dates-page__grid-container"
        >
          {isLoading ? (
            <MeetingDatesPageSkeleton />
          ) : (
            renderMeetingDatesPageGrids()
          )}
        </Grid>
      </Paper>
    </div>
  );
};
