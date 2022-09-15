import { Add as AddIcon } from '@mui/icons-material';
import { Divider, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { CustomButtonLink, H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { ClerkHomePageControlButtons } from 'components/clerkHomePage/ClerkHomePageControlButtons';
import { ClerkInterpreterAutocompleteFilters } from 'components/clerkInterpreter/filters/ClerkInterpreterAutocompleteFilters';
import { ClerkInterpreterToggleFilters } from 'components/clerkInterpreter/filters/ClerkInterpreterToggleFilters';
import { ClerkInterpreterListing } from 'components/clerkInterpreter/listing/ClerkInterpreterListing';
import { ClerkHomePageSkeleton } from 'components/skeletons/ClerkHomePageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';

export const ClerkHomePage: FC = () => {
  const { interpreters, status } = useAppSelector(clerkInterpretersSelector);
  const isLoading = status === APIResponseStatus.InProgress;

  const { t } = useAppTranslation({ keyPrefix: 'otr.pages.clerkHomepage' });

  const renderClerkHomePageGrids = () => (
    <>
      <Grid item>
        <div className="columns">
          <div
            className="columns gapped grow"
            data-testid="clerk-interpreter-registry__heading"
          >
            <H2>{t('register')}</H2>
            <Text>{`(${interpreters.length})`}</Text>
          </div>
          <div className="flex-end">
            <CustomButtonLink
              data-testid="clerk-interpreter-registry__add-new-interpreter"
              startIcon={<AddIcon />}
              color={Color.Secondary}
              variant={Variant.Contained}
              to={AppRoutes.ClerkPersonSearchPage}
            >
              {t('addInterpreter')}
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
            <ClerkInterpreterToggleFilters />
          </div>
        </div>
      </Grid>
      <Grid item>
        <ClerkInterpreterAutocompleteFilters />
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
        <ClerkInterpreterListing />
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
