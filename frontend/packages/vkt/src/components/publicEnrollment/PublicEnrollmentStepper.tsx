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

  const steps = includePaymentStep
    ? [
        PublicEnrollmentFormStep.Authenticate,
        PublicEnrollmentFormStep.FillContactDetails,
        PublicEnrollmentFormStep.SelectExam,
        PublicEnrollmentFormStep.Preview,
        PublicEnrollmentFormStep.Payment,
        PublicEnrollmentFormStep.Done,
      ]
    : [
        PublicEnrollmentFormStep.Authenticate,
        PublicEnrollmentFormStep.FillContactDetails,
        PublicEnrollmentFormStep.SelectExam,
        PublicEnrollmentFormStep.Preview,
        PublicEnrollmentFormStep.Done,
      ];

  const doneStepNumber = steps.length;
  const getStatusText = (stepNumber: number) => {
    if (stepNumber < activeStep) {
      return t('completed');
    }
  };

  const isError = activeStep === PublicEnrollmentFormStep.PaymentFail;

  const getDescription = (stepNumber: number) => {
    return t(`step.${PublicEnrollmentFormStep[stepNumber]}`);
  };

  const getStepAriaLabel = (stepNumber: number) => {
    const part = t('phaseNumber', {
      current: stepNumber,
      total: steps.length,
    });
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
      aria-label={t('phases')}
    >
      {steps.map((i) => (
        <Step key={i} completed={isStepCompleted(i)}>
          <StepLabel
            error={i === doneStepNumber && isError}
            aria-label={getStepAriaLabel(i)}
            className={
              activeStep < i
                ? 'public-enrollment__grid__stepper__step-disabled'
                : undefined
            }
            aria-hidden="true"
          >
            {getDescription(i)}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
