import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { CustomButton, H2, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { PaymentStatus } from 'enums/api';
import { AppRoutes } from 'enums/app';

const PaymentSuccess = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.payment.success.whatsNext',
  });

  return (
    <>
      <H2>{t('title')}</H2>
      <Text>{t('part1')}</Text>
      <Text>
        {t('part2')}
        <br />
        {t('part3')}
      </Text>
      <div>
        <Text>{t('beforeYkiTest.description')}</Text>
        <div className="columns gapped-xxs">
          <Link href={t('beforeYkiTest.url')} target="_blank">
            <Text className="bold">{t('beforeYkiTest.label')}</Text>
          </Link>
          <OpenInNewIcon />
        </div>
      </div>
      <div>
        <Text>{t('specialArrangements.description')}</Text>
        <div className="columns gapped-xxs">
          <Link href={t('specialArrangements.url')} target="_blank">
            <Text className="bold">{t('specialArrangements.label')}</Text>
          </Link>
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

  return <Text>{t('description')}</Text>;
};

const PaymentError = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.payment.error',
  });

  return <Text>{t('description')}</Text>;
};

export const Payment = () => {
  const [params] = useSearchParams();
  const paymentStatus = params.get('status') as PaymentStatus;
  const translateCommon = useCommonTranslation();

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

  return (
    <div className="margin-top-xxl rows gapped">
      {renderPayment()}
      <CustomButton
        className="fit-content-max-width"
        color={Color.Secondary}
        variant={Variant.Contained}
        href={AppRoutes.Registration}
      >
        {translateCommon('backToHomePage')}
      </CustomButton>
    </div>
  );
};
