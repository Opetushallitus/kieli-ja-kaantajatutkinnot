import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClerkAddOrganizer } from 'components/clerkRegister/ClerkAddOrganizer';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { H2 } from 'ophTheme/Text';
import { loadAllOrganizations } from 'redux/reducers/clerkOrganizer';

export const ClerkAddOrganizerPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkAddOrganizerPage',
  });

  useEffect(() => {
    dispatch(loadAllOrganizations());
  }, [dispatch]);

  return (
    <Box className="clerk-add-organizer-page">
      <div className="columns gapped-xs">
        <IconButton
          color="secondary"
          className="clerk-add-organizer-page__home-button"
          onClick={() => navigate(AppRoutes.ClerkOrganizerRegister)}
        >
          <HomeOutlined color="secondary" fontSize="large" />
        </IconButton>
        <ChevronRight color="disabled" fontSize="large" />
        <H2>{t('heading')}</H2>
      </div>

      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-add-organizer-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-add-organizer-page__grid-container__search-results"
        >
          <ClerkAddOrganizer />
        </Paper>
      </Grid>
    </Box>
  );
};
