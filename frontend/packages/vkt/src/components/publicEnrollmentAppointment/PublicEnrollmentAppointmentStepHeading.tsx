import { useEffect } from 'react';
import { H1, HeaderSeparator } from 'shared/components';
import { useFocus, useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentAppointmentStepHeading = ({
  activeStep,
  isEnrollmentToQueue,
}: {
  activeStep: PublicEnrollmentFormStep;
  isEnrollmentToQueue: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepHeading',
  });
  const [ref, setFocus] = useFocus<HTMLDivElement>();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    if (!isPhone) {
      setFocus();
    }
  }, [setFocus, isPhone]);

  const headingText =
    activeStep === PublicEnrollmentFormStep.Authenticate
      ? isEnrollmentToQueue
        ? t(`toQueue.${PublicEnrollmentFormStep[activeStep]}`)
        : t(`toExam.${PublicEnrollmentFormStep[activeStep]}`)
      : t(`common.${PublicEnrollmentFormStep[activeStep]}`);

  return (
    <div ref={ref} className="margin-top-xxl rows gapped-xs">
      <H1>{headingText}</H1>
      <HeaderSeparator />
    </div>
  );
};
