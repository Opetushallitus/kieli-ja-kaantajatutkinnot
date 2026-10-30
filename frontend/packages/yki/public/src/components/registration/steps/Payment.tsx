import { OphLink } from '@opetushallitus/oph-design-system';
import { useSearchParams } from 'react-router';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
import { H2, Text } from 'components/Text';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints, PaymentStatus } from 'enums/api';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { sessionSelector } from 'redux/selectors/session';

const PaymentSuccess = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.payment.success.whatsNext',
  });

  const { loggedInSession } = useAppSelector(sessionSelector);
  const isSuomiFiSession =
    loggedInSession && loggedInSession['auth-method'] === 'SUOMIFI';
  const omaOpintopolkuUrl =
    window.location.origin.replace(/yki\./, '') + '/oma-opintopolku/';

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
        <OphLink href={t('beforeYkiTest.url')} target="_blank">
          {t('beforeYkiTest.label')}
        </OphLink>
      </div>
      <div>
        <Text>{t('specialArrangements.description')}</Text>
        <OphLink href={t('specialArrangements.url')} target="_blank">
          {t('specialArrangements.label')}
        </OphLink>
      </div>
      <div>
        <Text component="div">
          {t('toUserPortal.description')}
          <br />
          {isSuomiFiSession && (
            <OphLink href={`${APIEndpoints.Authenticate}?toUserPortal=true`}>
              {t('toUserPortal.link.label')}
            </OphLink>
          )}
          {!isSuomiFiSession && (
            <OphLink href={omaOpintopolkuUrl} target="_blank">
              {t('toUserPortal.link.omaOpintopolkuLabel')}
            </OphLink>
          )}
        </Text>
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
  const { isFree } = useAppSelector(publicFreeRegistrationSelector);

  const renderPayment = () => {
    if (isFree === 'YES') {
      return <PaymentSuccess />;
    } else {
      switch (paymentStatus) {
        case PaymentStatus.Success:
          return <PaymentSuccess />;
        case PaymentStatus.Cancel:
          return <PaymentCancel />;
        default:
          return <PaymentError />;
      }
    }
  };

  return (
    <div className="margin-top-xxl rows gapped">
      {renderPayment()}
      <BackToFrontPageButton />
    </div>
  );
};
