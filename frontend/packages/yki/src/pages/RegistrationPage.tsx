import { Alert, Box, Grid, Paper } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { PublicExamSessionListing } from 'components/registration/examSession/PublicExamSessionListing';
import { PublicExamSessionFilters } from 'components/registration/examSession/PublicExamSessionListingFilters';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { loadExamSessions } from 'redux/reducers/examSessions';
import {
  examSessionsSelector,
  selectFilteredPublicExamSessions,
} from 'redux/selectors/examSessions';

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
  const { status, exam_sessions } = useAppSelector(examSessionsSelector);
  const [results, setResults] = useState<Array<ExamSession>>([]);
  const filteredExamSessions = useAppSelector(selectFilteredPublicExamSessions);
  const onApplyFilters = () => {
    setResults(filteredExamSessions);
  };
  const onEmptyFilters = () => {
    setResults(exam_sessions);
  };

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamSessions());
    } else if (status === APIResponseStatus.Success) {
      setResults(exam_sessions);
    }
  }, [dispatch, status, exam_sessions]);

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
            <H2 className="public-registration-page__filters__heading-title">
              Hae tutkintotilaisuuksia
            </H2>
            <Alert
              className="public-registration-page__filters__heading-description"
              severity={Severity.Info}
            >
              Joku lisähuomio hakukriteereistä tähän?
            </Alert>
            <PublicExamSessionFilters
              onApplyFilters={onApplyFilters}
              onEmptyFilters={onEmptyFilters}
            />
          </Paper>
        </Grid>
        <Grid item className="public-homepage__grid-container__result-box">
          {hasResults && <PublicExamSessionListing examSessions={results} />}
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
