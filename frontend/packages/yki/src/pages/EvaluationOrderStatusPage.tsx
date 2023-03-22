import { Box } from '@mui/system';
import { useSearchParams } from 'react-router-dom';
import { H1, H2 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

enum OrderStatus {
  Success = 'payment-success',
  Cancel = 'payment-cancel',
  Error = 'payment-error',
}

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

const useOrderStatusComponent = () => {
  const [params] = useSearchParams();
  const status = params.get('status');
  switch (status) {
    case OrderStatus.Success:
      return <Success />;
    case OrderStatus.Cancel:
      return <Cancel />;
    default:
      return <Error />;
  }
};

export const EvaluationOrderStatusPage = () => {
  const orderStatus = useOrderStatusComponent();

  return <Box>{orderStatus}</Box>;
};
