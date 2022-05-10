import { CircularProgress, CircularProgressProps } from '@mui/material';

import { Color } from '../../enums/common';
import { H3 } from '../Text/Text';
import './CircularStepper.scss';

interface CircularStepperProps extends CircularProgressProps {
  value: number;
  phaseText: string;
  ariaLabel: string;
}

export const CircularStepper = ({
  phaseText,
  ariaLabel,
  ...rest
}: CircularStepperProps) => {
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
