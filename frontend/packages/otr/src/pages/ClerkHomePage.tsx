import { Add as AddIcon } from '@mui/icons-material';
import { Alert, Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { CustomButtonLink, H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';

import { ClerkHomePageControlButtons } from 'components/clerkHomePage/ClerkHomePageControlButtons';
import { ClerkInterpreterAutocompleteFilters } from 'components/clerkInterpreter/filters/ClerkInterpreterAutocompleteFilters';
import { ClerkInterpreterToggleFilters } from 'components/clerkInterpreter/filters/ClerkInterpreterToggleFilters';
import { ClerkInterpreterListing } from 'components/clerkInterpreter/listing/ClerkInterpreterListing';
import { ClerkHomePageSkeleton } from 'components/skeletons/ClerkHomePageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkMissingInterpreters } from 'redux/reducers/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';

export const ClerkHomePage: FC = () => {
  const [page, setPage] = useState(0);
  const { interpreters, missingInterpreters, status, missingStatus } =
    useAppSelector(clerkInterpretersSelector);
  const isLoading = status === APIResponseStatus.InProgress;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (missingStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkMissingInterpreters());
    }
  }, [dispatch, missingStatus]);

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
            <ClerkInterpreterToggleFilters setPage={setPage} />
          </div>
        </div>
      </Grid>
      <Grid item>
        <ClerkInterpreterAutocompleteFilters setPage={setPage} />
      </Grid>
      <Grid item>
        <div className="columns space-between">
          <ClerkHomePageControlButtons />
        </div>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
      {missingInterpreters?.length > 0 && (
        <Grid item>
          <Alert severity={Severity.Error}>
            {t('missingInterpreters', {
              interpreters: missingInterpreters.join(', '),
            })}
          </Alert>
        </Grid>
      )}
      <Grid item>
        <ClerkInterpreterListing page={page} setPage={setPage} />
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
