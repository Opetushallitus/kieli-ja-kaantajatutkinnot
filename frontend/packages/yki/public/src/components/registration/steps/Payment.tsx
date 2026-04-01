import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { H2, Text } from 'shared/components';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
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
        <div className="columns gapped-xxs">
          <Link href={t('beforeYkiTest.url')} target="_blank">
            <Text color="textPrimary" className="bold">
              {t('beforeYkiTest.label')}
            </Text>
          </Link>
          <OpenInNewIcon color="inherit" />
        </div>
      </div>
      <div>
        <Text>{t('specialArrangements.description')}</Text>
        <div className="columns gapped-xxs">
          <Link href={t('specialArrangements.url')} target="_blank">
            <Text color="textPrimary" className="bold">
              {t('specialArrangements.label')}
            </Text>
          </Link>
          <OpenInNewIcon color="inherit" />
        </div>
      </div>
      <div>
        <Text>
          {t('toUserPortal.description')}
          <br />
          {isSuomiFiSession && (
            <Link href={`${APIEndpoints.Authenticate}?toUserPortal=true`}>
              <Text color="textPrimary" className="bold">
                {t('toUserPortal.link.label')}
              </Text>
            </Link>
          )}
          {!isSuomiFiSession && (
            <div className="columns gapped-xxs">
              <Link href={omaOpintopolkuUrl} target="_blank">
                <Text color="textPrimary" className="bold">
                  {t('toUserPortal.link.omaOpintopolkuLabel')}
                </Text>
              </Link>
              <OpenInNewIcon color="inherit" />
            </div>
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
