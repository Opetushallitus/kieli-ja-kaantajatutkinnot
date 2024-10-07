import {
  BaseSelectProps,
  FormControl,
  FormHelperText,
  Select,
} from '@mui/material';
import { FC } from 'react';

import { Variant } from '../../enums';
import { ComboBoxOption } from '../../interfaces';
import { Text } from '../Text/Text';

export interface CustomNativeSelectProps
  extends Omit<BaseSelectProps<string>, 'value'> {
  'data-testid'?: string;
  helperText?: string;
  showError?: boolean;
  placeholder: string;
  value: ComboBoxOption | undefined;
  values: Array<ComboBoxOption>;
}

const CustomSelect = ({
  value,
  values,
  placeholder,
  ...rest
}: CustomNativeSelectProps) => {
  const options = [{ label: placeholder, value: '' }, ...values];
  const inputValue = value && value.value ? value.value : '';

  return (
    <Select variant={Variant.Outlined} value={inputValue} {...rest} native>
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
};

export const NativeSelect: FC<CustomNativeSelectProps> = ({
  showError,
  helperText,
  ...rest
}) => {
  return (
    <FormControl fullWidth error={showError}>
      <CustomSelect {...rest} />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export const NativeSelectWithLabel: FC<
  CustomNativeSelectProps & { id: string; label: string }
> = ({ id, showError, helperText, label, ...rest }) => {
  const errorStyles = showError ? { color: 'error.main' } : {};

  return (
    <FormControl data-testid={rest['data-testid']} fullWidth error={showError}>
      <label htmlFor={id}>
        <Text sx={errorStyles}>
          <b>{label}</b>
        </Text>
      </label>
      <CustomSelect {...rest} />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
