import { Step, StepLabel, Stepper } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { CircularStepper, H2, Text } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PaymentStatus } from 'enums/api';
import { PublicRegistrationFormStep } from 'enums/publicRegistration';
import { registrationSelector } from 'redux/selectors/registration';

export const PublicRegistrationStepper = () => {
  const { activeStep } = useAppSelector(registrationSelector);
  const { status: initRegistrationStatus } =
    useAppSelector(registrationSelector).initRegistration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.stepper',
  });
  const translateCommon = useCommonTranslation();
  const { isPhone } = useWindowProperties();

  const [params] = useSearchParams();
  const paymentStatus = params.get('status');

  const isError =
    (activeStep === PublicRegistrationFormStep.Done &&
      paymentStatus !== PaymentStatus.Success) ||
    (activeStep === PublicRegistrationFormStep.Register &&
      initRegistrationStatus === APIResponseStatus.Error);

  const doneStepNumber = PublicRegistrationFormStep.Done;

  const stepNumbers = Object.values(PublicRegistrationFormStep)
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

  const getDescription = (stepNumber: number) => {
    return t(`step.${PublicRegistrationFormStep[stepNumber]}`);
  };

  const getNextInformation = (stepNumber: number) => {
    if (stepNumber < doneStepNumber) {
      return `${translateCommon('next')}: ${getDescription(activeStep + 1)}`;
    } else if (isError) {
      return '';
    } else {
      return t('welcomeToExam');
    }
  };

  const getStepAriaLabel = (stepNumber: number) => {
    const part = `${stepNumber}/${stepNumbers.length}`;
    const statusText = getStatusText(stepNumber);
    const partStatus = statusText ? `${part}, ${statusText}` : part;

    return `${t('phase')} ${partStatus}: ${getDescription(stepNumber)}`;
  };

  const stepValue = Math.min(activeStep, doneStepNumber);

  const mobileStepValue = stepValue * (100 / doneStepNumber);
  const mobilePhaseText = `${stepValue}/${doneStepNumber}`;
  const mobileAriaLabel = `${t('phase')} ${mobilePhaseText}: ${getDescription(
    activeStep
  )}`;

  if (isPhone) {
    return (
      <div className="columns gapped-xxl public-registration__grid__circular-stepper-container">
        <CircularStepper
          value={mobileStepValue}
          ariaLabel={mobileAriaLabel}
          phaseText={mobilePhaseText}
          color={isError ? Color.Error : Color.Secondary}
          size={90}
        />
        <div className="rows">
          <H2>{getDescription(activeStep)}</H2>
          <Text>{getNextInformation(activeStep)}</Text>
        </div>
      </div>
    );
  } else {
    return (
      <Stepper
        className="public-registration__grid__stepper"
        activeStep={activeStep - 1}
      >
        {stepNumbers.map((i) => (
          <Step key={i}>
            <StepLabel
              aria-label={getStepAriaLabel(i)}
              error={isError && activeStep === i}
              className={
                activeStep === i && isError
                  ? 'public-registration__grid__stepper__step-error'
                  : activeStep < i
                  ? 'public-registration__grid__stepper__step-disabled'
                  : undefined
              }
            >
              {getDescription(i)}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  }
};
