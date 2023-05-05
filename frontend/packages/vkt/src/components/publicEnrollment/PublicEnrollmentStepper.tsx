import { Step, StepLabel, Stepper } from '@mui/material';
import { useEffect } from 'react';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentStepper = ({
  activeStep,
  includePaymentStep,
}: {
  activeStep: PublicEnrollmentFormStep;
  includePaymentStep: boolean;
}) => {
  useEffect(() => {
    document
      .getElementById(`public-enrollment-step-label-${activeStep}`)
      ?.focus();
  }, [activeStep]);

  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

  const doneStepNumber = includePaymentStep
    ? PublicEnrollmentFormStep.Done
    : PublicEnrollmentFormStep.Done - 1;

  const stepNumbers = Object.values(PublicEnrollmentFormStep)
    .filter((i) => !isNaN(Number(i)))
    .map(Number)
    .filter((i) => i <= doneStepNumber);

  const getStatusText = (stepNumber: number) => {
    if (stepNumber < activeStep) {
      return t('completed');
    }
  };

  const getDescription = (stepNumber: number) => {
    const i =
      !includePaymentStep && stepNumber >= PublicEnrollmentFormStep.Payment
        ? stepNumber + 1
        : stepNumber;

    return t(`step.${PublicEnrollmentFormStep[i]}`);
  };

  const getStepAriaLabel = (stepNumber: number) => {
    const part = `${stepNumber} kautta ${stepNumbers.length}`;
    const statusText = getStatusText(stepNumber);
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  return (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={activeStep - 1}
      aria-label="Ilmoittautumisen vaiheet"
    >
      {stepNumbers.map((i) => (
        <Step
          key={i}
          aria-label={getStepAriaLabel(i)}
          aria-current={activeStep == i ? 'step' : undefined}
          tabIndex={0}
          id={`public-enrollment-step-label-${i}`}
        >
          <StepLabel
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
