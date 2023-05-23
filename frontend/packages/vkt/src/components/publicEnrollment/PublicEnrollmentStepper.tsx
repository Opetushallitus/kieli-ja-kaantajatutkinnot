import { Step, StepLabel, Stepper } from '@mui/material';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export const PublicEnrollmentStepper = ({
  activeStep,
  includePaymentStep,
}: {
  activeStep: PublicEnrollmentFormStep;
  includePaymentStep: boolean;
}) => {
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
    } else if (stepNumber === activeStep) {
      return t('active');
    }
  };

  const isError = activeStep === PublicEnrollmentFormStep.PaymentFail;

  const getDescription = (stepNumber: number) => {
    const i =
      !includePaymentStep &&
      stepNumber >= PublicEnrollmentFormStep.PaymentSuccess
        ? stepNumber + 1
        : stepNumber;

    return t(`step.${PublicEnrollmentFormStep[i]}`);
  };

  const getStepAriaLabel = (stepNumber: number) => {
    const part = `${stepNumber}/${stepNumbers.length}`;
    const statusText = getStatusText(stepNumber);
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const isStepCompleted = (stepNumber: number) =>
    stepNumber < activeStep && !(isError && stepNumber === doneStepNumber);

  return (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={activeStep - 1}
    >
      {stepNumbers.map((i) => (
        <Step key={i} completed={isStepCompleted(i)}>
          <StepLabel
            error={i === doneStepNumber && isError}
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
