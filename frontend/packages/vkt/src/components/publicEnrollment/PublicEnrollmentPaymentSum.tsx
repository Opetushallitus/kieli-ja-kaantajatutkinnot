import { H1 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { PublicFreeEnrollmentDetails } from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentPaymentSum = ({
  enrollment,
  freeEnrollmentDetails,
}: {
  enrollment: PublicEnrollment;
  freeEnrollmentDetails?: PublicFreeEnrollmentDetails;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.paymentSum',
  });

  const sum = PublicEnrollmentUtils.calculateExaminationPaymentSum(
    enrollment,
    freeEnrollmentDetails,
  );

  const content = enrollment.isFree
    ? `${t('title')}:  ${t('free')}`
    : `${t('title')}: ${sum.toFixed(2).replace('.', ',')} €`;

  return (
    <div className="columns flex-end">
      <H1 className="margin-top-lg">{content}</H1>
    </div>
  );
};
