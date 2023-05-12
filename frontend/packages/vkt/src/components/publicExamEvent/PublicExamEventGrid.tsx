import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CustomButton,
  ExtLink,
  H1,
  H2,
  HeaderSeparator,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { MobileAppBar } from 'components/common/MobileAppBar';
import { PublicExamEventListing } from 'components/publicExamEvent/listing/PublicExamEventListing';
import { PublicExamEventGridSkeleton } from 'components/skeletons/PublicExamEventGridSkeleton';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { loadPublicExamEvents } from 'redux/reducers/publicExamEvent';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

export const PublicExamEventGrid = () => {
  // I18
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const { status, examEvents, selectedExamEvent } = useAppSelector(
    publicExamEventsSelector
  );
  const { reservationDetailsStatus } = useAppSelector(publicEnrollmentSelector);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    dispatch(resetPublicEnrollment());
    dispatch(loadPublicExamEvents());
  }, [dispatch]);

  // State
  const isLoading = status === APIResponseStatus.InProgress;
  const hasResults = examEvents.length > 0;
  const isInitialisationInProgress =
    reservationDetailsStatus === APIResponseStatus.InProgress;

  return (
    <>
      <Grid item className="public-homepage__grid-container__item-header">
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <HeaderSeparator />
        <Text>
          {t('description.text')}
          <ExtLink
            text={t('description.linkName')}
            href={translateCommon('vktHomepage.link')}
            endIcon={<OpenInNewIcon />}
            aria-label={translateCommon('vktHomepage.ariaLabel')}
          />
        </Text>
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
                <Trans
                  t={translateCommon}
                  i18nKey="examinationPaymentsDescription"
                ></Trans>
              </Text>
            </>
          )}
        </Paper>
      </Grid>
      <Grid item className="public-homepage__grid-container__result-box">
        {hasResults && <PublicExamEventListing status={status} />}
        {!hasResults && !isLoading && (
          <H2 className="public-homepage__grid-container__result-box__no-results">
            {t('noSearchResults')}
          </H2>
        )}
      </Grid>
      {isPhone && selectedExamEvent && (
        <MobileAppBar>
          <LoadingProgressIndicator isLoading={isInitialisationInProgress}>
            <CustomButton
              data-testid="public-exam-events__enroll-btn"
              color={Color.Secondary}
              variant={Variant.Contained}
              onClick={() =>
                navigate(
                  AppRoutes.PublicAuth.replace(
                    ':examEventId',
                    selectedExamEvent.id.toString()
                  )
                )
              }
              fullWidth
            >
              {translateCommon('enroll')}
            </CustomButton>
          </LoadingProgressIndicator>
        </MobileAppBar>
      )}
    </>
  );
};
