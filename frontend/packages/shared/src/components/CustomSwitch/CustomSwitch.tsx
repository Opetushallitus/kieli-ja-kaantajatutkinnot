import {
  FormControlLabel,
  FormGroup,
  Switch,
  SwitchProps,
} from '@mui/material';

import { Caption, Text } from '../Text/Text';

interface CustomSwitchProps extends SwitchProps {
  dataTestId?: string;
  leftLabel: string;
  rightLabel: string;
  errorLabel?: string;
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
          disabled={disabled}
          control={
            <Switch
              data-testid={dataTestId}
              checked={value}
              color={'secondary'}
              onChange={onChange}
            />
          }
          label={rightLabel}
        />
      </div>
      {errorLabel && (
        <Caption data-testid={`${dataTestId}__error-label`} color={'error'}>
          {errorLabel}
        </Caption>
      )}
    </FormGroup>
  );
};
