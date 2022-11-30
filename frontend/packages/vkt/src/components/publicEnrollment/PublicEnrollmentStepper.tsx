import { Step, StepLabel, Stepper } from '@mui/material';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentStepper = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

  const getStepNumbers = Object.values(PublicEnrollmentFormStep)
    .filter((i) => !isNaN(Number(i)))
    .map(Number);

  const getStatusText = (stepNumber: number) => {
    if (stepNumber < activeStep) {
      return t('completed');
    } else if (stepNumber === activeStep) {
      return t('active');
    }
  };

  const getDescription = (stepNumber: number) =>
    t(`step.${PublicEnrollmentFormStep[stepNumber]}`);

  const getStepAriaLabel = (stepNumber: number) => {
    const part = `${stepNumber}/${Math.max(...getStepNumbers)}`;
    const statusText = getStatusText(stepNumber);
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  return (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={activeStep - 1}
    >
      {getStepNumbers.map((i) => (
        <Step key={i}>
          <StepLabel
            aria-label={getStepAriaLabel(i)}
            className={
              activeStep < i
                ? 'public-enrollment__grid__stepper__step-disabled'
                : undefined
            }
          >
            {getDescription(i)}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
