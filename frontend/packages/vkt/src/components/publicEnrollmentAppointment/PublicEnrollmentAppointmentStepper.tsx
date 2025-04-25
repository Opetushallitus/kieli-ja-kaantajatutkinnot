import { Step, StepLabel, Stepper, Typography } from '@mui/material';
import { CircularStepper, Text } from 'shared/components';
import { Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentUtils } from 'utils/publicEnrollment';

export const PublicEnrollmentAppointmentStepper = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
}) => {
  const { isPhone } = useWindowProperties();

  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentAppointment',
  });
  const translateCommon = useCommonTranslation();

  const steps = PublicEnrollmentUtils.getEnrollmentAppointmentSteps(isPhone);

  const doneStepNumber = steps.length;

  const getDescription = (step: PublicEnrollmentAppointmentFormStep) => {
    return t(`stepHeading.${PublicEnrollmentAppointmentFormStep[step]}`);
  };

  const getStepAriaLabel = (stepNumber: number, stepIndex: number) => {
    const part = t('stepper.phaseNumber', {
      current: stepIndex + 1,
      total: steps.length,
    });
    const statusText = isStepCompleted(stepNumber)
      ? t('stepper.completed')
      : '';
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('stepper.phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const getDesktopActiveStep = () => {
    return activeStep - 1;
  };

  const hasError = (step: PublicEnrollmentAppointmentFormStep) => {
    return (
      step === PublicEnrollmentAppointmentFormStep.PaymentFail &&
      step === activeStep
    );
  };

  const isStepCompleted = (step: PublicEnrollmentAppointmentFormStep) => {
    return step < activeStep;
  };

  const stepValue = Math.min(activeStep, doneStepNumber);

  const mobileStepValue = stepValue * (100 / doneStepNumber);
  const mobilePhaseText = `${stepValue}/${doneStepNumber}`;
  const mobileAriaLabel = `${t('stepper.phase')} ${mobilePhaseText}: ${t(
    `stepHeading.${PublicEnrollmentAppointmentFormStep[activeStep]}`,
  )}`;

  const getMobileStepperHeading = () => {
    const heading = (
      <Typography component="p" variant="h2">
        {t(`stepper.step.${PublicEnrollmentAppointmentFormStep[activeStep]}`)}
      </Typography>
    );

    if (
      activeStep === PublicEnrollmentAppointmentFormStep.PaymentSuccess ||
      activeStep === PublicEnrollmentAppointmentFormStep.PaymentFail
    ) {
      return <>{heading}</>;
    }

    const nextStepIndex =
      activeStep < PublicEnrollmentAppointmentFormStep.Preview
        ? activeStep + 1
        : PublicEnrollmentAppointmentFormStep.PaymentSuccess;

    return (
      <>
        {heading}
        <div>
          <Text>
            {translateCommon('next')}
            {': '}
            {t(
              `stepper.step.${PublicEnrollmentAppointmentFormStep[nextStepIndex]}`,
            )}
          </Text>
        </div>
      </>
    );
  };

  return isPhone ? (
    <div className="public-enrollment-contact__grid__stepper columns gapped-xxl">
      <div role="group" aria-label={t('phases')}>
        <CircularStepper
          value={mobileStepValue}
          ariaLabel={mobileAriaLabel}
          phaseText={mobilePhaseText}
          color={
            activeStep === PublicEnrollmentAppointmentFormStep.PaymentFail
              ? Color.Error
              : Color.Secondary
          }
          size={90}
        />
      </div>
      <div className="rows gapped-xs grow">{getMobileStepperHeading()}</div>
    </div>
  ) : (
    <Stepper
      className="public-enrollment__grid__stepper"
      activeStep={getDesktopActiveStep()}
      aria-label={t('stepper.phases')}
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
