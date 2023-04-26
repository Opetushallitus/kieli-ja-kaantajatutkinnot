import { Box } from '@mui/material';
import { H1, H2 } from 'shared/components';

import { OrderStatus } from 'components/orderStatus/OrderStatus';
import { usePublicTranslation } from 'configs/i18n';

const Success = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderStatusPage.success',
  });

  return (
    <>
      <H1>{t('title')}</H1>
      <H2>{t('info')}</H2>
    </>
  );
};

const Cancel = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderStatusPage.cancel',
  });

  return (
    <>
      <H1>{t('title')}</H1>
      <H2>{t('info')}</H2>
    </>
  );
};

const Error = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderStatusPage.error',
  });

  return (
    <>
      <H1>{t('title')}</H1>
      <H2>{t('info')}</H2>
    </>
  );
};

export const EvaluationOrderStatusPage = () => {
  return (
    <Box>
      <OrderStatus onSuccess={Success} onCancel={Cancel} onDefault={Error} />
    </Box>
  );
};
