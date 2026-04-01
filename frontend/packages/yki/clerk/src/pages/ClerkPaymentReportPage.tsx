import { Box, Grid, Paper, Typography } from '@mui/material';
import { FC } from 'react';

import { ClerkPaymentReport } from 'components/clerkPaymentReport/ClerkPaymentReport';
import { usePublicTranslation } from 'configs/i18n';

export const ClerkPaymentReportPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.clerkPaymentReportPage',
  });

  return (
    <Box className="clerk-payment-report-page">
      <Typography variant="h2">{t('heading')}</Typography>
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-payment-report-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-payment-report-page__grid-container__results"
        >
          <ClerkPaymentReport />
        </Paper>
      </Grid>
    </Box>
  );
};
