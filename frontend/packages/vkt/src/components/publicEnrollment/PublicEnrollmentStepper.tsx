import { Step, StepLabel, Stepper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { CircularStepper } from 'shared/components';
import { Color } from 'shared/enums';
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
  const { isPhone } = useWindowProperties();

  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.stepper',
  });

  const steps = PublicEnrollmentUtils.getEnrollmentSteps(includePaymentStep);

  const doneStepNumber = steps.length;

  const getDescription = (step: PublicEnrollmentFormStep) => {
    return t(`step.${PublicEnrollmentFormStep[step]}`);
  };

  const getPhaseDescription = (stepNumber: number) => {
    const part = t('phaseNumber', {
      current: stepNumber,
      total: doneStepNumber,
    });

    const statusText = isStepCompleted(stepNumber) ? t('completed') : '';
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const getDesktopActiveStep = () => {
    // "Hack" for not having Mui-Active for Payment step
    if (activeStep === PublicEnrollmentFormStep.Payment) {
      return activeStep;
    } else if (
      activeStep === PublicEnrollmentFormStep.Done ||
      activeStep === PublicEnrollmentFormStep.DoneQueued
    ) {
      return doneStepNumber - 1;
    }

    return activeStep - 1;
  };

  const hasError = (step: PublicEnrollmentFormStep) => {
    return step === PublicEnrollmentFormStep.Payment && step === activeStep;
  };

  const isStepCompleted = (step: PublicEnrollmentFormStep) => {
    return step < activeStep;
  };

  const stepValue = Math.min(activeStep, doneStepNumber);

  const mobileStepValue = stepValue * (100 / doneStepNumber);
  const mobilePhaseText = `${stepValue}/${doneStepNumber}`;

  return isPhone ? (
    <div role="group" aria-label={t('phases')}>
      <CircularStepper
        value={mobileStepValue}
        ariaLabel={getPhaseDescription(stepValue)}
        phaseText={mobilePhaseText}
        color={
          activeStep === PublicEnrollmentFormStep.Payment
            ? Color.Error
            : Color.Secondary
        }
        size={90}
      />
    </div>
  ) : (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={getDesktopActiveStep()}
      aria-label={t('phases')}
      role="group"
    >
      {steps.map((step, index) => (
        <Step
          data-testid={`enrollment-step-${index}`}
          key={step}
          completed={isStepCompleted(step)}
        >
          <StepLabel
            error={hasError(step)}
            aria-current={getDesktopActiveStep() === step - 1 && 'step'}
            className={
              activeStep < step
                ? 'public-enrollment__grid__stepper__step-disabled'
                : undefined
            }
          >
            <Typography sx={visuallyHidden}>
              {getPhaseDescription(step)}
            </Typography>
            <span aria-hidden={true}>{getDescription(step)}</span>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
