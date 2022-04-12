import { CircularProgress, CircularProgressProps } from '@mui/material';

import { H3 } from 'components/elements/Text';
import { useCommonTranslation } from 'configs/i18n';
import { Color } from 'enums/app';

interface CircularStepperProps extends CircularProgressProps {
  value: number;
  phaseText: string;
  phaseDescription: string;
}

export const CircularStepper = ({
  phaseText,
  phaseDescription,
  ...rest
}: CircularStepperProps) => {
  const translateCommon = useCommonTranslation();
  const ariaLabel = `${translateCommon(
    'phase'
  )} ${phaseText}: ${phaseDescription}`;

  return (
    <div className="circular-stepper">
      <CircularProgress
        aria-label={ariaLabel}
        className="circular-stepper__progress"
        color={Color.Secondary}
        variant="determinate"
        {...rest}
      />
      <div className="circular-stepper__heading">
        <H3>{phaseText}</H3>
      </div>
    </div>
  );
};
