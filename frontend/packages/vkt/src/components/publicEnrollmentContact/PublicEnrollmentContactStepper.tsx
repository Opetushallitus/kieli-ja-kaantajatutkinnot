import { Step, StepLabel, Stepper } from '@mui/material';
import { CircularStepper } from 'shared/components';
import { Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentContactStepper = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  const { isPhone } = useWindowProperties();

  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

  const steps = PublicEnrollmentUtils.getEnrollmentContactSteps();

  const doneStepNumber = steps.length;

  const getDescription = (step: PublicEnrollmentContactFormStep) => {
    return t(`step.${PublicEnrollmentContactFormStep[step]}`);
  };

  const getStepAriaLabel = (stepNumber: number, stepIndex: number) => {
    const part = t('phaseNumber', {
      current: stepIndex + 1,
      total: steps.length,
    });
    const statusText = isStepCompleted(stepNumber) ? t('completed') : '';
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const getDesktopActiveStep = () => {
    return activeStep - 1;
  };

  const hasError = (step: PublicEnrollmentContactFormStep) => {
    return (
      step === PublicEnrollmentContactFormStep.PaymentFail &&
      step === activeStep
    );
  };

  const isStepCompleted = (step: PublicEnrollmentContactFormStep) => {
    return step < activeStep;
  };

  const stepValue = Math.min(activeStep, doneStepNumber);

  const mobileStepValue = stepValue * (100 / doneStepNumber);
  const mobilePhaseText = `${stepValue}/${doneStepNumber}`;
  const mobileAriaLabel = `${t('phase')} ${mobilePhaseText}: ${t(
    `step.${PublicEnrollmentContactFormStep[activeStep]}`,
  )}`;

  return isPhone ? (
    <CircularStepper
      value={mobileStepValue}
      ariaLabel={mobileAriaLabel}
      phaseText={mobilePhaseText}
      color={
        activeStep === PublicEnrollmentContactFormStep.PaymentFail
          ? Color.Error
          : Color.Secondary
      }
      size={90}
    />
  ) : (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={getDesktopActiveStep()}
      aria-label={t('phases')}
    >
      {steps.map((step, index) => (
        <Step
          data-testid={`enrollment-step-${index}`}
          key={step}
          completed={isStepCompleted(step)}
        >
          {/* eslint-disable jsx-a11y/aria-role */}
          <StepLabel
            error={hasError(step)}
            aria-label={getStepAriaLabel(step, index)}
            role="text"
            className={
              activeStep < step
                ? 'public-enrollment__grid__stepper__step-disabled'
                : undefined
            }
          >
            {/* eslint-enable */}
            {getDescription(step)}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
