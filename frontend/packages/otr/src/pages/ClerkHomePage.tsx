import { Add as AddIcon } from '@mui/icons-material';
import { Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { CustomButtonLink, H1, H2, Text } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { ClerkInterpreterListing } from 'components/clerkInterpreter/ClerkInterpreterListing';
import { ClerkHomePageSkeleton } from 'components/skeletons/ClerkHomePageSkeleton';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkInterpreters } from 'redux/reducers/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';

export const ClerkHomePage: FC = () => {
  const { interpreters, status } = useAppSelector(clerkInterpretersSelector);
  const isLoading = status === APIResponseStatus.InProgress;
  const dispatch = useAppDispatch();

  const { t } = useAppTranslation({ keyPrefix: 'otr.pages.clerkHomepage' });

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadClerkInterpreters());
    }
  }, [dispatch, status]);

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
              to={AppRoutes.ClerkHomePage}
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
