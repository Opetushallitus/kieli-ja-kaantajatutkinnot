import { useEffect } from 'react';
import { H1, HeaderSeparator } from 'shared/components';
import { useFocus, useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentAppointmentStepHeading = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment.stepHeading',
  });
  const [ref, setFocus] = useFocus<HTMLDivElement>();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    if (!isPhone) {
      setFocus();
    }
  }, [setFocus, isPhone]);

  const headingText = t(PublicEnrollmentAppointmentFormStep[activeStep]);

  return (
    <div ref={ref} className="margin-top-xxl rows gapped-xs">
      <H1>{headingText}</H1>
      <HeaderSeparator />
    </div>
  );
};
