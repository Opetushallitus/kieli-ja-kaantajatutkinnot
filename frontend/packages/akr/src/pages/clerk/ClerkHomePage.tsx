import { Add as AddIcon } from '@mui/icons-material';
import { Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { CustomButtonLink, H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { ClerkHomePageControlButtons } from 'components/clerkHomePage/ClerkHomePageControlButtons';
import { ClerkTranslatorAutocompleteFilters } from 'components/clerkTranslator/filters/ClerkTranslatorAutocompleteFilters';
import { ClerkTranslatorEmailFilter } from 'components/clerkTranslator/filters/ClerkTranslatorEmailFilter';
import { ClerkTranslatorToggleFilters } from 'components/clerkTranslator/filters/ClerkTranslatorToggleFilters';
import { ClerkTranslatorListing } from 'components/clerkTranslator/listing/ClerkTranslatorListing';
import { ClerkHomePageSkeleton } from 'components/skeletons/ClerkHomePageSkeleton';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkTranslators } from 'redux/reducers/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkHomePage: FC = () => {
  const { translators, status } = useAppSelector(clerkTranslatorsSelector);
  const isLoading = status === APIResponseStatus.InProgress;
  const dispatch = useAppDispatch();

  const { t } = useAppTranslation({ keyPrefix: 'akr.pages.clerkHomepage' });
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkTranslators());
    }
  }, [dispatch, status]);

  const renderClerkHomePageGrids = () => (
    <>
      <Grid item>
        <div className="columns">
          <div
            className="columns gapped grow"
            data-testid="clerk-translator-registry__heading"
          >
            <H2>{translateCommon('register')}</H2>
            <Text>{`(${translators.length})`}</Text>
          </div>
          <div className="flex-end">
            <CustomButtonLink
              data-testid="clerk-translator-registry__add-new-translator"
              startIcon={<AddIcon />}
              color={Color.Secondary}
              variant={Variant.Contained}
              to={AppRoutes.ClerkNewTranslatorPage}
            >
              {t('buttons.newTranslator')}
            </CustomButtonLink>
          </div>
        </div>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid item>
        <div className="columns">
          <div className="clerk-homepage__grid-container__register-controls grow columns">
            <ClerkTranslatorToggleFilters />
          </div>
        </div>
      </Grid>
      <ClerkTranslatorAutocompleteFilters />
      <Grid>
        <ClerkTranslatorEmailFilter />
      </Grid>
      <Grid item>
        <div className="columns space-between">
          <ClerkHomePageControlButtons />
        </div>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid item>
        <ClerkTranslatorListing />
      </Grid>
    </>
  );

  return (
    <div className="clerk-homepage">
      <H1>{t('title')}</H1>
      <Paper elevation={3}>
        <Grid
          container
          direction="column"
          className="clerk-homepage__grid-container"
        >
          {isLoading ? <ClerkHomePageSkeleton /> : renderClerkHomePageGrids()}
        </Grid>
      </Paper>
    </div>
  );
};
