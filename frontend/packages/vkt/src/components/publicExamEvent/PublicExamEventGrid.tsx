import { Alert, Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { PublicExamEventListing } from 'components/publicExamEvent/listing/PublicExamEventListing';
import { PublicExamEventGridSkeleton } from 'components/skeletons/PublicExamEventGridSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadPublicExamEvents } from 'redux/reducers/publicExamEvent';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicExamEventGrid = () => {
  // I18
  const { t } = useAppTranslation({ keyPrefix: 'vkt.pages.homepage' });
  // Redux
  const { status, examEvents } = useAppSelector(publicExamEventsSelector);
  const dispatch = useAppDispatch();

  // State
  const isLoading = status === APIResponseStatus.InProgress;
  const hasResults = examEvents.length > 0;

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadPublicExamEvents());
    }
  }, [dispatch, status]);

  return (
    <>
      <Grid item className="public-homepage__grid-container__item-header">
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <HeaderSeparator />
        <Text>{t('description')}</Text>
      </Grid>
      <Grid item className="public-homepage__grid-container__item-exam-events">
        <Paper elevation={3} className="public-homepage__exam-events">
          {isLoading ? (
            <PublicExamEventGridSkeleton />
          ) : (
            <>
              <Alert
                className="public-homepage__exam-events__heading-description"
                severity={Severity.Info}
              >
                {t('note')}
              </Alert>
              <H2 className="public-homepage__exam-events__heading-title">
                {t('examinationDates.title')}
              </H2>
              <Text>
                <Trans t={t} i18nKey="examinationDates.description"></Trans>
              </Text>
            </>
          )}
          {hasResults && <PublicExamEventListing status={status} />}
          {!hasResults && !isLoading && (
            <H2 className="public-homepage__grid-container__result-box__no-results">
              {t('noSearchResults')}
            </H2>
          )}
        </Paper>
      </Grid>
    </>
  );
};
