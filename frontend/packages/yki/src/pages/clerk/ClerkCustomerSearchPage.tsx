import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { FC } from 'react';

import { ClerkCustomerSearch } from 'components/clerkCustomer/ClerkCustomerSearch';
import { usePublicTranslation } from 'configs/i18n';
import { H2 } from 'ophTheme/Text';

export const ClerkCustomerSearchPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkCustomersSearchPage',
  });

  return (
    <Box className="clerk-customers-search-page">
      <div className="columns gapped-xs">
        <IconButton
          color="secondary"
          className="clerk-customers-search-page__home-button"
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
        className="clerk-customers-search-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-customers-search-page__grid-container__results"
        >
          <ClerkCustomerSearch />
        </Paper>
      </Grid>
    </Box>
  );
};
