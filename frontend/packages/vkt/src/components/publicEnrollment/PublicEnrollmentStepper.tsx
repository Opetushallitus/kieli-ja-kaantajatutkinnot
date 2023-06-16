import { Step, StepLabel, Stepper } from '@mui/material';
import { useEffect } from 'react';
import { CircularStepper } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

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
  const { isPhone } = useWindowProperties();

  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

  const steps = PublicEnrollmentUtils.getEnrollmentSteps(includePaymentStep);

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

  const mobileStepValue = activeStep * (100 / doneStepNumber);
  const mobilePhaseText = `${activeStep}/${doneStepNumber}`;
  const mobileAriaLabel = `${t('phase')} ${mobilePhaseText}: ${t(
    `step.${PublicEnrollmentFormStep[activeStep]}`
  )}`;

  return isPhone ? (
    <CircularStepper
      value={mobileStepValue}
      ariaLabel={mobileAriaLabel}
      phaseText={mobilePhaseText}
      size={90}
    />
  ) : (
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
