import { Alert, Box, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { PublicExamSessionListing } from 'components/registration/examSession/PublicExamSessionListing';
import { PublicExamSessionFilters } from 'components/registration/examSession/PublicExamSessionListingFilters';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadExamSessions } from 'redux/reducers/examSessions';
import { examSessionsSelector } from 'redux/selectors/examSessions';

/*
const ExamSessionsSkeleton = () => {
  // TODO
  return <div />;
};

const ExamSessionsListing = () => {};
*/

export const RegistrationPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(examSessionsSelector);
  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamSessions());
    }
  }, [dispatch, status]);

  const hasResults = true;
  const hasNoResults = false;

  return (
    <Box className="public-registration-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-registration-page__grid-container"
      >
        <Grid
          item
          className="public-registration-page__grid-container__item-header"
        >
          <H1 data-testid="public-registration-page__title-heading">
            {t('title')}
          </H1>
          <HeaderSeparator />
          <Text>Tähän hieman tekstiä. Jotain yleistä selostusta kenties?</Text>
          <Text>
            Toinenkin kappale. Lisää selostusta. Laitetaan ehkä joku linkkikin
            mukaan?
          </Text>
        </Grid>
        <Grid
          item
          className="public-registration-page__grid-container__item-filters"
        >
          <Paper elevation={3} className="public-registration-page__filters">
            <H1 className="public-registration-page__filters__heading-title">
              Hae tutkintotilaisuuksia
            </H1>
            <Alert
              className="public-registration-page__filters__heading-description"
              severity={Severity.Info}
            >
              Joku lisähuomio hakukriteereistä tähän?
            </Alert>
            <PublicExamSessionFilters />
          </Paper>
        </Grid>
        <Grid item className="public-homepage__grid-container__result-box">
          {hasResults && <PublicExamSessionListing />}
          {hasNoResults && (
            <H2 className="public-homepage__grid-container__result-box__no-results">
              {t('noSearchResults')}
            </H2>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};