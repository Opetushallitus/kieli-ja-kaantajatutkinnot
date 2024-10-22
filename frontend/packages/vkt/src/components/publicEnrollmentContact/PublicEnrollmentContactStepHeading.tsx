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
    keyPrefix: 'vkt.component.publicEnrollment.stepHeading',
  });
  const [ref, setFocus] = useFocus<HTMLDivElement>();
  const { isPhone } = useWindowProperties();

  useEffect(() => {
    if (!isPhone) {
      setFocus();
    }
  }, [setFocus, isPhone]);

  const headingText = t(
    `common.${PublicEnrollmentContactFormStep[activeStep]}`,
  );

  return (
    <div ref={ref} className="margin-top-xxl rows gapped-xs">
      <H1>{headingText}</H1>
      <HeaderSeparator />
    </div>
  );
};
