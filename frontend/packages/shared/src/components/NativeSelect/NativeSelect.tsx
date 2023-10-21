import {
  FormControl,
  FormHelperText,
  Select,
  SelectProps,
} from '@mui/material';
import { FC } from 'react';

import { Variant } from '../../enums';
import { ComboBoxOption } from '../../interfaces';
import { Text } from '../Text/Text';

export interface CustomNativeSelectProps extends SelectProps {
  'data-testid'?: string;
  helperText?: string;
  showError?: boolean;
  placeholder: string;
  value: ComboBoxOption | null;
  values: Array<ComboBoxOption>;
}

const CustomSelect = ({
  value,
  values,
  placeholder,
  ...rest
}: CustomNativeSelectProps) => {
  const options = [{ label: placeholder, value: '' }, ...values];

  return (
    <Select
      variant={Variant.Outlined}
      value={value?.value || ''}
      {...rest}
      native
    >
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
  CustomNativeSelectProps & { label: string }
> = ({ id, showError, helperText, label, ...rest }) => {
  const errorStyles = showError ? { color: 'error.main' } : {};

  return (
    <FormControl fullWidth error={showError}>
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
