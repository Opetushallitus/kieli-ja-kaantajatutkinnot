import { useEffect } from 'react';
import { H1, HeaderSeparator } from 'shared/components';
import { useFocus, useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentContactStepHeading = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact.stepHeading',
  });
  const [ref, setFocus] = useFocus<HTMLDivElement>();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    if (!isPhone) {
      setFocus();
    }
  }, [setFocus, isPhone]);

  const headingText = t(PublicEnrollmentContactFormStep[activeStep]);

  return (
    <div
      ref={ref}
      className="public-enrollment-contact__grid__step-heading margin-top-xxl rows gapped-xs"
    >
      <H1>{headingText}</H1>
      <HeaderSeparator />
    </div>
  );
};
