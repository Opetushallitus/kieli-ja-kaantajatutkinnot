import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, Grid, Link, Paper } from '@mui/material';
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

export const RegistrationPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  const dispatch = useAppDispatch();
  const { status, exam_sessions } = useAppSelector(examSessionsSelector);
  const [results, setResults] = useState<Array<ExamSession>>([]);
  const [showResults, setShowResults] = useState(false);
  const filteredExamSessions = useAppSelector(selectFilteredPublicExamSessions);
  const onApplyFilters = () => {
    setResults(filteredExamSessions);
    setShowResults(true);
  };
  const onEmptyFilters = () => {
    setResults(exam_sessions);
    setShowResults(false);
  };

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamSessions());
    } else if (status === APIResponseStatus.Success) {
      setResults(exam_sessions);
    }
  }, [dispatch, status, exam_sessions]);

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
          <div className="rows gapped">
            <div>
              <Text>{t('description.part1.text')}</Text>
              <div className="columns gapped-xxs">
                <Link href={t('description.part1.link.url')} target="_blank">
                  <Text>{t('description.part1.link.label')}</Text>
                </Link>
                <OpenInNewIcon />
              </div>
            </div>
            <Text>{t('description.part2.general')}</Text>
            <div>
              <Text>{t('description.part2.languages')}</Text>
              <div className="columns gapped-xxs">
                <Link href={t('description.part2.link.url')} target="_blank">
                  <Text>{t('description.part2.link.label')}</Text>
                </Link>
                <OpenInNewIcon />
              </div>
            </div>
          </div>
        </Grid>
        <Grid
          item
          className="public-registration-page__grid-container__item-filters"
        >
          <Paper elevation={3} className="public-registration-page__filters">
            <H2 className="public-registration-page__filters__heading-title">
              {t('filters.heading')}
            </H2>
            <Alert
              className="public-registration-page__filters__heading-description"
              severity={Severity.Info}
            >
              {t('filters.information')}
            </Alert>
            <PublicExamSessionFilters
              onApplyFilters={onApplyFilters}
              onEmptyFilters={onEmptyFilters}
            />
          </Paper>
        </Grid>
        {showResults && (
          <Grid
            item
            className="public-registration-page__grid-container__result-box"
          >
            <PublicExamSessionListing examSessions={results} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
