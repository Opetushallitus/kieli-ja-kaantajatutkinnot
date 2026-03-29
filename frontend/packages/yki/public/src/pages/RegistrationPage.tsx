import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, Box, Container, Grid, Link, Paper } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { H1, H2, HeaderSeparator, Text, WebLink } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { SuomiFiLink } from 'components/elements/SuomiFiLink';
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

const InformationBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage.infoBox',
  });

  return (
    <Container className="public-registration-page__info-box rows gapped">
      <Text>
        {t('part1')} {t('part2')}{' '}
        <Trans
          i18nKey="part3"
          t={t}
          components={{
            CustomLink: <SuomiFiLink />,
          }}
        />
      </Text>
      <Text>
        {t('part4')}{' '}
        <WebLink
          href={t('afterYkiTest.url')}
          label={t('afterYkiTest.label')}
          target="_blank"
          endIcon={<OpenInNewIcon />}
        />
      </Text>
    </Container>
  );
};

export const RegistrationPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(examSessionsSelector);
  const [results, setResults] = useState<Array<ExamSession>>([]);
  const [updateResults, setUpdateResults] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const filteredExamSessions = useAppSelector(selectFilteredPublicExamSessions);
  const onApplyFilters = () => {
    dispatch(loadExamSessions());
    setUpdateResults(true);
    setShowResults(true);
    setPage(0);
  };

  // Pagination
  const [page, setPage] = useState(0);
  const rowsPerPageOptions = [10, 20, 50];
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamSessions());
    } else if (status === APIResponseStatus.Success && updateResults) {
      setResults(filteredExamSessions);
      setUpdateResults(false);
    }
  }, [dispatch, updateResults, status, filteredExamSessions]);

  return (
    <Box className="public-registration-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-registration-page__grid-container"
      >
        <Grid className="public-registration-page__grid-container__item-header">
          <InformationBox />
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
            <div>
              <Text>{t('description.part2.text')}</Text>
              <div className="columns gapped-xxs">
                <Link href={t('description.part2.link.url')} target="_blank">
                  <Text>{t('description.part2.link.label')}</Text>
                </Link>
                <OpenInNewIcon />
              </div>
            </div>
            <div>
              <Text>{t('description.part3.text')}</Text>
              <div className="columns gapped-xxs">
                <Link href={t('description.part3.link.url')} target="_blank">
                  <Text>{t('description.part3.link.label')}</Text>
                </Link>
                <OpenInNewIcon />
              </div>
            </div>
          </div>
        </Grid>
        <Grid className="public-registration-page__grid-container__item-filters">
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
            <PublicExamSessionFilters onApplyFilters={onApplyFilters} />
          </Paper>
        </Grid>
        {showResults && (
          <Grid
            className="public-registration-page__grid-container__result-box"
            data-testid="public-registration-page__grid-container__result-box"
          >
            <PublicExamSessionListing
              examSessions={results}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
