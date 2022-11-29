import { H1 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentPaymentSum = ({
  activeStep,
  enrollment,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.paymentSum',
  });

  const sum = PublicEnrollmentUtils.calculateExaminationPaymentSum(enrollment);

  const content = `${t('title')}: ${sum.toFixed(2).replace('.', ',')} €`;

  return (
    <>
      {activeStep === PublicEnrollmentFormStep.Preview ? (
        <div className="columns flex-end">
          <H1 className="margin-top-lg">{content}</H1>
        </div>
      ) : null}
    </>
  );
};
