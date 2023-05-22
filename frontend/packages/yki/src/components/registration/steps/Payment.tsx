import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { H2, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { PaymentStatus } from 'enums/api';

const PaymentSuccess = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.payment.success.whatsNext',
  });

  return (
    <>
      <H2>{t('title')}</H2>
      <Text>{t('part1')}</Text>
      <div>
        <Text>{t('part2')}</Text>
        <Text>{t('part3')}</Text>
        <div className="columns gapped-xxs">
          <Text>
            <Link
              href={translateCommon('specialArrangementsLink')}
              target="_blank"
            >
              {t('linkLabel')}
            </Link>
          </Text>
          <OpenInNewIcon />
        </div>
      </div>
    </>
  );
};

const PaymentCancel = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.payment.cancel',
  });

  return (
    <>
      <H2>{t('title')}</H2>
      <Text>{t('description')}</Text>
    </>
  );
};

const PaymentError = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.payment.error',
  });

  return (
    <>
      <H2>{t('title')}</H2>
      <Text>{t('description')}</Text>
    </>
  );
};

export const Payment = () => {
  const [params] = useSearchParams();
  const paymentStatus = params.get('status') as PaymentStatus;

  const renderPayment = () => {
    switch (paymentStatus) {
      case PaymentStatus.Success:
        return <PaymentSuccess />;
      case PaymentStatus.Cancel:
        return <PaymentCancel />;
      default:
        return <PaymentError />;
    }
  };

  return <div className="margin-top-xxl rows gapped">{renderPayment()}</div>;
};
