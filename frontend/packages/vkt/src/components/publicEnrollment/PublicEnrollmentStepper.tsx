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

  const getDescription = (stepNumber: number) => {
    const i =
      !includePaymentStep && stepNumber >= PublicEnrollmentFormStep.Payment
        ? stepNumber + 1
        : stepNumber;

    return t(`step.${PublicEnrollmentFormStep[i]}`);
  };

  return (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={activeStep - 1}
    >
      {stepNumbers.map((i) => (
        <Step key={i}>
          <StepLabel
            aria-current={activeStep == i ? 'step' : undefined}
            id={`public-enrollment-step-label-${i}`}
            tabIndex={i}
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
