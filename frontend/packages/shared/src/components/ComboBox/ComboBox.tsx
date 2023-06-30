import {
  Autocomplete,
  AutocompleteProps,
  FormControl,
  FormHelperText,
  TextField,
} from '@mui/material';

import { Text } from '../Text/Text';

type ComboBoxOption = { label: string; value: string };
export type AutocompleteValue = ComboBoxOption | null;
interface ComboBoxProps {
  label?: string;
  showInputLabel?: boolean;
  helperText?: string;
  showError?: boolean;
  variant: 'filled' | 'outlined' | 'standard';
  getOptionLabel?: (option: AutocompleteValue) => string;
  values: Array<ComboBoxOption>;
  value: AutocompleteValue;
}

type AutoCompleteComboBox = Omit<
  AutocompleteProps<AutocompleteValue, false, false, false>,
  'options' | 'renderInput'
>;

const compareOptionLabels = (a: ComboBoxOption, b: ComboBoxOption) => {
  return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
};

export const sortOptionsByLabels = (options: Array<ComboBoxOption>) => {
  return options.sort(compareOptionLabels);
};

const isOptionEqualToValue = (
  option: AutocompleteValue,
  value: AutocompleteValue
) => {
  if (option === null && value === null) {
    return true;
  } else if (option === null || value === null) {
    return false;
  } else {
    return option.value === value.value;
  }
};

export const valueAsOption = (value: string) => ({
  value: value,
  label: value,
});

export const ComboBox = ({
  label,
  values,
  variant,
  helperText,
  showError,
  ...rest
}: ComboBoxProps & AutoCompleteComboBox) => {
  const getOptionLabel = (option: AutocompleteValue): string => {
    const [activeOption] = values.filter((v) => v.value === option?.value);

    return activeOption ? activeOption.label : '';
  };

  return (
    <FormControl fullWidth error={showError}>
      <Autocomplete
        disablePortal
        {...rest}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        options={values}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant={variant}
            error={showError}
          />
        )}
      />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export const LabeledComboBox = ({
  id,
  label,
  values,
  variant,
  helperText,
  showError,
  placeholder,
  ...rest
}: ComboBoxProps & AutoCompleteComboBox & { id: string }) => {
  const getOptionLabel = (option: AutocompleteValue): string => {
    const [activeOption] = values.filter((v) => v.value === option?.value);

    return activeOption ? activeOption.label : '';
  };
  const errorStyles = showError ? { color: 'error.main' } : {};

  return (
    <FormControl fullWidth error={showError}>
      <label htmlFor={id}>
        <Text sx={errorStyles}>
          <b>{label}</b>
        </Text>
      </label>
      <Autocomplete
        disablePortal
        id={id}
        {...rest}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        options={values}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant={variant}
            error={showError}
          />
        )}
      />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
