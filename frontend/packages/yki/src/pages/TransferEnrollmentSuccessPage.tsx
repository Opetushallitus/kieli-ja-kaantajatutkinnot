import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Grid, Link, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  H1,
  H2,
  HeaderSeparator,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadTransferEnrollmentDetails } from 'redux/reducers/transferEnrollment';
import { transferEnrollmentSelector } from 'redux/selectors/transferEnrollment';
import { ExamSessionUtils } from 'utils/examSession';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferEnrollmentSuccessPage',
  });

  return (
    <Grid className="transfer-enrollment-success-page__item-header">
      <H1>{t('title')}</H1>
      <HeaderSeparator />
    </Grid>
  );
};

const InformationBox = () => {
  const { transferEnrollmentDetails } = useAppSelector(
    transferEnrollmentSelector,
  );
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferEnrollmentSuccessPage.information',
  });
  const translateCommon = useCommonTranslation();

  if (!transferEnrollmentDetails) {
    return null;
  }
  const lang = getCurrentLang();
  const location = ExamSessionUtils.getLocationInfo(
    transferEnrollmentDetails,
    lang,
  );

  return (
    <Grid className="transfer-enrollment-success-page__item-header">
      <Paper
        elevation={3}
        className="transfer-enrollment-success-page__information"
      >
        <div className="rows">
          <Text>
            {translateCommon('examination')}:{' '}
            <b>
              {ExamSessionUtils.languageAndLevelText(transferEnrollmentDetails)}
            </b>
          </Text>
          <Text>
            {translateCommon('examDate')}:{' '}
            <b>
              {DateUtils.formatOptionalDate(
                transferEnrollmentDetails.session_date,
                'l',
              )}
            </b>
          </Text>
          <Text>
            {translateCommon('institution')}:{' '}
            <b>{`${location.name}, ${
              location.street_address
            }, ${ExamSessionUtils.getMunicipality(location)}`}</b>
          </Text>
        </div>
        <H2>{t('heading')}</H2>
        <Text>{t('part1')}</Text>
        <Text>
          {t('part2')}
          <br />
          {t('part3')}
        </Text>
        <div>
          <Text>{t('beforeYkiTest.description')}</Text>
          <div className="columns gapped-xxs">
            <Link href={t('beforeYkiTest.url')} target="_blank">
              <Text className="bold">{t('beforeYkiTest.label')}</Text>
            </Link>
            <OpenInNewIcon />
          </div>
        </div>
        <div>
          <Text>{t('specialArrangements.description')}</Text>
          <div className="columns gapped-xxs">
            <Link href={t('specialArrangements.url')} target="_blank">
              <Text className="bold">{t('specialArrangements.label')}</Text>
            </Link>
            <OpenInNewIcon />
          </div>
        </div>
      </Paper>
    </Grid>
  );
};

export const TransferEnrollmentSuccessPage = () => {
  const { loadDetailsStatus } = useAppSelector(transferEnrollmentSelector);
  const dispatch = useAppDispatch();
  const params = useParams();

  useEffect(() => {
    if (
      loadDetailsStatus === APIResponseStatus.NotStarted &&
      params.registrationId
    ) {
      dispatch(loadTransferEnrollmentDetails(+params.registrationId));
    }
  }, [dispatch, params.registrationId, loadDetailsStatus]);

  const loading = loadDetailsStatus === APIResponseStatus.InProgress;

  return (
    <Box className="transfer-enrollment-success-page">
      <LoadingProgressIndicator isLoading={loading}>
        <Grid
          container
          direction="column"
          className="transfer-enrollment-success-page__grid-container"
        >
          <Header />
          <InformationBox />
        </Grid>
      </LoadingProgressIndicator>
    </Box>
  );
};
