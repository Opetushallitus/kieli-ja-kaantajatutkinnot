import { H1, HeaderSeparator } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentStepHeading = ({
  activeStep,
  isEnrollmentToQueue,
}: {
  activeStep: PublicEnrollmentFormStep;
  isEnrollmentToQueue: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepHeading',
  });

  const headingText =
    activeStep === PublicEnrollmentFormStep.Authenticate
      ? isEnrollmentToQueue
        ? t(`toQueue.${PublicEnrollmentFormStep[activeStep]}`)
        : t(`toExam.${PublicEnrollmentFormStep[activeStep]}`)
      : t(`common.${PublicEnrollmentFormStep[activeStep]}`);

  return (
    <div className="margin-top-xxl rows gapped-xs">
      <H1>{headingText}</H1>
      <HeaderSeparator />
    </div>
  );
};
