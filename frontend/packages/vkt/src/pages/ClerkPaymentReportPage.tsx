import { Box, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import {
  CustomButton,
  CustomDatePicker,
  H1,
  H2,
  LoadingProgressIndicator,
} from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useClerkTranslation } from 'configs/i18n';

export const ClerkPaymentReportPage: FC = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.paymentReport',
  });
  const isLoading = false;

  return (
    <Box className="clerk-payment-report-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-payment-report-page__grid-container"
      >
        <Grid item>
          <H1 sx={{ marginBottom: 0 }}>{t('paymentReport')}</H1>
        </Grid>
        <Grid item>
          <Paper
            elevation={3}
            className="clerk-payment-report-page__paper rows gapped-xxl"
          >
            <div className="rows gapped">
              <H2>{t('timespan')}</H2>
              <div className="columns gapped">
                <CustomDatePicker
                  value={null}
                  setValue={() => {}}
                  label={t('datePicker.begin')}
                />
                <CustomDatePicker
                  value={null}
                  setValue={() => {}}
                  label={t('datePicker.end')}
                />
              </div>
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={isLoading}
                  onClick={() => {}}
                >
                  {t('download')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
