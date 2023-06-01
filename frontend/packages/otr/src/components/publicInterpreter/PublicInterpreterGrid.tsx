import { Alert, Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { PublicInterpreterFilters } from 'components/publicInterpreter/filters/PublicInterpreterFilters';
import { PublicInterpreterListing } from 'components/publicInterpreter/listing/PublicInterpreterListing';
import { PublicInterpreterGridSkeleton } from 'components/skeletons/PublicInterpreterGridSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import {
  publicInterpretersSelector,
  selectFilteredPublicInterpreters,
} from 'redux/selectors/publicInterpreter';

export const PublicInterpreterGrid = () => {
  // I18
  const { t } = useAppTranslation({ keyPrefix: 'otr.pages.homepage' });
  // Redux
  const { status } = useAppSelector(publicInterpretersSelector);
  const interpreters = useAppSelector(selectFilteredPublicInterpreters);

  // State
  const [showTable, setShowTable] = useState(false);
  const hasResults = interpreters.length > 0 && showTable;
  const hasNoResults = !hasResults && showTable;
  const isLoading = status === APIResponseStatus.InProgress;
  const [page, setPage] = useState(0);

  return (
    <>
      <Grid item className="public-homepage__grid-container__item-header">
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <HeaderSeparator />
        <Text>{t('description')}</Text>
      </Grid>
      <Grid item className="public-homepage__grid-container__item-filters">
        <Paper elevation={3} className="public-homepage__filters">
          {isLoading ? (
            <PublicInterpreterGridSkeleton
              showTable={hasResults && showTable}
              setShowTable={setShowTable}
            />
          ) : (
            <>
              <H2 className="public-homepage__filters__heading-title">
                {t('filters.title')}
              </H2>
              <Alert
                className="public-homepage__filters__heading-description"
                severity={Severity.Info}
              >
                {t('note')}
              </Alert>
              <PublicInterpreterFilters
                showTable={hasResults && showTable}
                setShowTable={setShowTable}
                setPage={setPage}
              />
            </>
          )}
        </Paper>
      </Grid>
      <Grid item className="public-homepage__grid-container__result-box">
        {hasResults && (
          <PublicInterpreterListing
            status={status}
            interpreters={interpreters}
            controlledPaging={{ page, setPage }}
          />
        )}
        {hasNoResults && (
          <H2 className="public-homepage__grid-container__result-box__no-results">
            {t('noSearchResults')}
          </H2>
        )}
      </Grid>
    </>
  );
};
