import { Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { AddExaminationDate } from 'components/clerkTranslator/examinationDates/AddExaminationDate';
import { ExaminationDatesListing } from 'components/clerkTranslator/examinationDates/ExaminationDatesListing';
import { ExaminationDatesToggleFilters } from 'components/clerkTranslator/examinationDates/ExaminationDatesToggleFilters';
import { MeetingDatesPageSkeleton } from 'components/skeletons/MeetingDatesPageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  loadExaminationDates,
  resetExaminationDateAdd,
  resetExaminationDateRemove,
} from 'redux/reducers/examinationDate';
import { examinationDatesSelector } from 'redux/selectors/examinationDate';

export const ExaminationDatesPage: FC = () => {
  const {
    examinationDates: { status, dates },
    addExaminationDate,
    removeExaminationDate,
  } = useAppSelector(examinationDatesSelector);
  const isLoading = status === APIResponseStatus.InProgress;
  const dispatch = useAppDispatch();

  const { t } = useAppTranslation({ keyPrefix: 'akr.pages' });
  const { showToast } = useToast();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExaminationDates());
    }
  }, [dispatch, status]);

  useEffect(() => {
    const { status, date } = addExaminationDate;

    if (status === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('examinationDatesPage.toasts.addingSucceeded', {
          date: DateUtils.formatOptionalDate(date),
        }),
      });
    }

    if (
      status === APIResponseStatus.Success ||
      status === APIResponseStatus.Error
    ) {
      dispatch(resetExaminationDateAdd());
    }
  }, [dispatch, addExaminationDate, showToast, t]);

  useEffect(() => {
    const { status, date } = removeExaminationDate;

    if (status === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('examinationDatesPage.toasts.removingSucceeded', {
          date: DateUtils.formatOptionalDate(date),
        }),
      });
    }

    if (
      status === APIResponseStatus.Success ||
      status === APIResponseStatus.Error
    ) {
      dispatch(resetExaminationDateRemove());
    }
  }, [dispatch, removeExaminationDate, showToast, t]);

  const renderExaminationDatesPageGrids = () => (
    <>
      <Grid item>
        <div
          className="columns gapped"
          data-testid="examination-dates-page__heading"
        >
          <H2>{t('examinationDatesPage.title')}</H2>
          <Text>{`(${dates.length})`}</Text>
        </div>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid
        className="examination-dates-page__grid-container__date-controls grow columns"
        item
      >
        <ExaminationDatesToggleFilters />
      </Grid>
      <Grid item>
        <AddExaminationDate />
      </Grid>
      <Grid item>
        <ExaminationDatesListing />
      </Grid>
    </>
  );

  return (
    <div className="examination-dates-page">
      <H1>{t('clerkHomepage.title')}</H1>
      <Paper elevation={3}>
        <Grid
          container
          direction="column"
          className="examination-dates-page__grid-container"
        >
          {isLoading ? (
            <MeetingDatesPageSkeleton />
          ) : (
            renderExaminationDatesPageGrids()
          )}
        </Grid>
      </Paper>
    </div>
  );
};
