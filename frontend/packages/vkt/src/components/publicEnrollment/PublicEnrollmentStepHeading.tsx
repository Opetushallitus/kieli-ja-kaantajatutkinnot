import { H2, HeaderSeparator } from 'shared/components';

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
    isEnrollmentToQueue &&
    (activeStep === PublicEnrollmentFormStep.Authenticate ||
      activeStep === PublicEnrollmentFormStep.Done)
      ? t(`toQueue.${activeStep}`)
      : t(`toExam.${activeStep}`);

  return (
    <div className="margin-top-xxl rows gapped-xs">
      <H2>{headingText}</H2>
      <HeaderSeparator />
    </div>
  );
};
