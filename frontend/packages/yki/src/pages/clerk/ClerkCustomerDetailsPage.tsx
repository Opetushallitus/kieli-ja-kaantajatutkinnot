import { ChevronRight, HomeOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { ClerkCustomerDetails } from 'components/customer/ClerkCustomerDetails';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { H2 } from 'ophTheme/Text';

export const ClerkCustomerDetailsPage: FC = () => {
  const translateCommon = useCommonTranslation();

  const navigate = useNavigate();

  return (
    <Box className="clerk-customer-details-page">
      <div className="columns gapped-xs">
        <IconButton
          color="secondary"
          className="clerk-customer-details-page__home-button"
          onClick={() => navigate(AppRoutes.CustomerSearch)}
        >
          <HomeOutlined color="secondary" fontSize="large" />
        </IconButton>
        <ChevronRight color="disabled" fontSize="large" />
        <H2>{translateCommon('loadingContent')}</H2>
      </div>

      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-customer-details-page__grid-container"
      >
        <Paper
          elevation={3}
          className="customer-details-page__grid-container__results"
        >
          <ClerkCustomerDetails />
        </Paper>
      </Grid>
    </Box>
  );
};
