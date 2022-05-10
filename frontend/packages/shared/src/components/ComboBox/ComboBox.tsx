import {
  Autocomplete,
  AutocompleteProps,
  FormControl,
  FormHelperText,
  TextField,
} from '@mui/material';

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

const autocompleteValueToString = (option: AutocompleteValue): string => {
  return option?.label || '';
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
  return (
    <FormControl fullWidth error={showError}>
      <Autocomplete
        disablePortal
        {...rest}
        getOptionLabel={autocompleteValueToString}
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
