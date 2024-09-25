import { H1 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentAppointmentPaymentSum = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.paymentSum',
  });

  const sum = PublicEnrollmentUtils.calculateAppointmentPaymentSum();

  const content =
    sum === 0
      ? `${t('title')}:  ${t('free')}`
      : `${t('title')}: ${sum.toFixed(2).replace('.', ',')} €`;

  return (
    <div className="columns flex-end">
      <H1
        data-testid="public-enrollment__payment-sum"
        className="margin-top-lg"
      >
        {content}
      </H1>
    </div>
  );
};
