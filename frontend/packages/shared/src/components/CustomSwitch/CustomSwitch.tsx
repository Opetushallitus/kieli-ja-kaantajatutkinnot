import {
  FormControlLabel,
  FormGroup,
  Switch,
  SwitchProps,
} from '@mui/material';
import { ReactNode } from 'react';

import { Color } from '../../enums/common';
import { Caption, Text } from '../Text/Text';
import './CustomSwitch.scss';

interface CustomSwitchProps extends SwitchProps {
  dataTestId?: string;
  leftLabel: string;
  rightLabel: string;
  errorLabel?: ReactNode;
  value?: boolean;
}

export const CustomSwitch = ({
  dataTestId,
  leftLabel,
  rightLabel,
  errorLabel,
  value,
  disabled,
  onChange,
}: CustomSwitchProps) => {
  const leftLabelClassName = disabled
    ? 'color-disabled margin-right-xs'
    : 'margin-right-xs';

  return (
    <FormGroup className="rows">
      <div className="columns">
        <Text className={leftLabelClassName}>{leftLabel}</Text>
        <FormControlLabel
          className="custom-switch__label"
          disabled={disabled}
          control={
            <Switch
              data-testid={dataTestId}
              checked={value}
              color={Color.Secondary}
              onChange={onChange}
            />
          }
          label={rightLabel}
        />
      </div>
      {errorLabel && (
        <Caption
          className="custom-switch__helper-text"
          data-testid={`${dataTestId}__error-label`}
          color={'error'}
        >
          {errorLabel}
        </Caption>
      )}
    </FormGroup>
  );
};
