import { Box, Grid, Paper } from '@mui/material';
import { Dayjs } from 'dayjs';
import { FC, useState } from 'react';
import { CustomButton, CustomDatePicker, H1, H2 } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useClerkTranslation } from 'configs/i18n';
import { RouteUtils } from 'utils/routes';

export const ClerkPaymentReportPage: FC = () => {
  const [from, setFrom] = useState<Dayjs | null>(null);
  const [to, setTo] = useState<Dayjs | null>(null);
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.paymentReport',
  });
  const downloadPaymentReport = () => {
    const fromSerialized = DateUtils.serializeDate(from ?? undefined);
    const toSerialized = DateUtils.serializeDate(to ?? undefined);
    if (fromSerialized && toSerialized) {
      window.location.href = RouteUtils.downloadPaymentReportRoute(
        fromSerialized,
        toSerialized,
      );
    }
  };

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
                  value={from}
                  setValue={setFrom}
                  label={t('datePicker.begin')}
                />
                <CustomDatePicker
                  value={to}
                  setValue={setTo}
                  label={t('datePicker.end')}
                />
              </div>
              <div className="flex-start">
                <CustomButton
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  onClick={downloadPaymentReport}
                >
                  {t('download')}
                </CustomButton>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
