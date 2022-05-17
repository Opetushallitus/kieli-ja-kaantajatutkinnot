import { Alert, Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';

import { PublicTranslatorFilters } from 'components/publicTranslator/filters/PublicTranslatorFilters';
import { PublicTranslatorListing } from 'components/publicTranslator/listing/PublicTranslatorListing';
import { PublicTranslatorGridSkeleton } from 'components/skeletons/PublicTranslatorGridSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import {
  publicTranslatorsSelector,
  selectFilteredPublicTranslators,
} from 'redux/selectors/publicTranslator';

export const PublicTranslatorGrid = () => {
  // I18
  const { t } = useAppTranslation({ keyPrefix: 'akt.pages.homepage' });
  // Redux
  const { status } = useAppSelector(publicTranslatorsSelector);
  const translators = useAppSelector(selectFilteredPublicTranslators);
  // State
  const [showTable, setShowTable] = useState(false);
  const hasResults = translators.length > 0 && showTable;
  const hasNoResults = !hasResults && showTable;
  const isLoading = status === APIResponseStatus.InProgress;

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
            <PublicTranslatorGridSkeleton
              showTable={hasResults && showTable}
              setShowTable={setShowTable}
            />
          ) : (
            <>
              <H1 className="public-homepage__filters__heading-title">
                {t('filters.title')}
              </H1>
              <Alert
                className="public-homepage__filters__heading-description"
                severity={Severity.Info}
              >
                {t('note')}
              </Alert>
              <PublicTranslatorFilters
                showTable={hasResults && showTable}
                setShowTable={setShowTable}
              />
            </>
          )}
        </Paper>
      </Grid>
      <Grid item className="public-homepage__grid-container__result-box">
        {hasResults && (
          <PublicTranslatorListing status={status} translators={translators} />
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
