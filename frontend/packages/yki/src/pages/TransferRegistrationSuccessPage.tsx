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
import { loadTransferRegistrationDetails } from 'redux/reducers/transferRegistration';
import { transferRegistrationSelector } from 'redux/selectors/transferRegistration';
import { ExamSessionUtils } from 'utils/examSession';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferRegistrationSuccessPage',
  });

  return (
    <Grid className="transfer-registration-success-page__item-header">
      <H1>{t('title')}</H1>
      <HeaderSeparator />
    </Grid>
  );
};

const InformationBox = () => {
  const { transferRegistrationDetails } = useAppSelector(
    transferRegistrationSelector,
  );
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferRegistrationSuccessPage.information',
  });
  const translateCommon = useCommonTranslation();

  if (!transferRegistrationDetails) {
    return null;
  }
  const lang = getCurrentLang();
  const location = ExamSessionUtils.getLocationInfo(
    transferRegistrationDetails,
    lang,
  );

  return (
    <Grid className="transfer-registration-success-page__item-header">
      <Paper
        elevation={3}
        className="transfer-registration-success-page__information"
      >
        <div className="rows">
          <Text>
            {translateCommon('examination')}:{' '}
            <b>
              {ExamSessionUtils.languageAndLevelText(
                transferRegistrationDetails,
              )}
            </b>
          </Text>
          <Text>
            {translateCommon('examDate')}:{' '}
            <b>
              {DateUtils.formatOptionalDate(
                transferRegistrationDetails.session_date,
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
          <Text>
            {t('specialArrangements.description1')}{' '}
            <b>{t('specialArrangements.description2')}</b>{' '}
            {t('specialArrangements.description3')}
          </Text>
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

export const TransferRegistrationSuccessPage = () => {
  const { loadDetailsStatus } = useAppSelector(transferRegistrationSelector);
  const dispatch = useAppDispatch();
  const params = useParams();

  useEffect(() => {
    if (
      loadDetailsStatus === APIResponseStatus.NotStarted &&
      params.registrationId
    ) {
      dispatch(loadTransferRegistrationDetails(+params.registrationId));
    }
  }, [dispatch, params.registrationId, loadDetailsStatus]);

  const loading = loadDetailsStatus === APIResponseStatus.InProgress;

  return (
    <Box className="transfer-registration-success-page">
      <LoadingProgressIndicator isLoading={loading}>
        <Grid
          container
          direction="column"
          className="transfer-registration-success-page__grid-container"
        >
          <Header />
          <InformationBox />
        </Grid>
      </LoadingProgressIndicator>
    </Box>
  );
};
