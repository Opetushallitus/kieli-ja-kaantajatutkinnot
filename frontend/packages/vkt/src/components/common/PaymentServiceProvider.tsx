import { Box } from '@mui/material';
import { Trans } from 'react-i18next';
import { H3, Text, WebLink } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const PaymentServiceProvider = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.paymentServiceProvider',
  });

  return (
    <div className="rows gapped">
      <H3>{t('title')}</H3>
      <Box
        sx={{
          '& .MuiTypography-root': {
            margin: 0,
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: '16px',
          },
        }}
      >
        <Text>{t('description')}</Text>
        <br />
        <Text>
          <Trans t={t} i18nKey="contactDetails" />
        </Text>
        <Text>{t('businessId')}</Text>
        <Text sx={{ overflowWrap: 'anywhere' }}>
          <WebLink href={t('url')} label={t('url')} />
        </Text>
      </Box>
    </div>
  );
};
