import {
  Autocomplete,
  AutocompleteProps,
  createFilterOptions,
  FilterOptionsState,
  FormControl,
  FormHelperText,
  TextField,
} from '@mui/material';

import { useWindowProperties } from '../../hooks';
import {
  CustomNativeSelectProps,
  NativeSelect,
} from '../NativeSelect/NativeSelect';
import { Text } from '../Text/Text';

type ComboBoxOption = { label: string; value: string };
export type AutocompleteValue = ComboBoxOption | null;
interface ComboBoxProps {
  'data-testid'?: string;
  label?: string;
  showInputLabel?: boolean;
  helperText?: string;
  showError?: boolean;
  variant: 'filled' | 'outlined' | 'standard';
  getOptionLabel?: (option: AutocompleteValue) => string;
  values: Array<ComboBoxOption>;
  value: AutocompleteValue;
  onChange: (value?: string) => void;
}

type AutoCompleteComboBox = Omit<
  AutocompleteProps<AutocompleteValue, false, false, false>,
  | 'options'
  | 'renderInput'
  | 'getOptionLabel'
  | 'isOptionEqualToValue'
  | 'filterOptions'
  | 'onChange'
>;

const compareOptionLabels = (a: ComboBoxOption, b: ComboBoxOption) => {
  return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
};

export const sortOptionsByLabels = (options: Array<ComboBoxOption>) => {
  return options.sort(compareOptionLabels);
};

const isOptionEqualToValue = (
  option: AutocompleteValue,
  value: AutocompleteValue,
) => {
  if (option === null && value === null) {
    return true;
  } else if (option === null || value === null) {
    return false;
  } else {
    return option.value === value.value;
  }
};

const filterOptions: (
  options: Array<AutocompleteValue>,
  state: FilterOptionsState<AutocompleteValue>,
) => Array<AutocompleteValue> = createFilterOptions({
  matchFrom: 'start',
  trim: true,
});

export const valueAsOption = (value: string) => ({
  value: value,
  label: value,
});

const NativeSelectOrComboBox = ({
  label,
  values,
  variant,
  helperText,
  showError,
  onChange,
  ...rest
}: ComboBoxProps & AutoCompleteComboBox) => {
  const { isPhone } = useWindowProperties();
  const getOptionLabel = (option: AutocompleteValue): string => {
    const [activeOption] = values.filter((v) => v.value === option?.value);

    return activeOption ? activeOption.label : '';
  };

  if (isPhone) {
    const nativeSelectProps: CustomNativeSelectProps = {
      placeholder: label || '',
      values,
      helperText,
      showError,
      value: rest.value || '',
      disabled: rest.disabled,
      'data-testid': rest['data-testid'],
      variant: 'outlined'
    };

    return (
      <NativeSelect
        {...nativeSelectProps}
        onChange={(e) => onChange(e.target.value as string)}
      />
    );
  } else {
    return (
      <Autocomplete
        disablePortal
        {...rest}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        options={values}
        filterOptions={filterOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant={variant}
            error={showError}
          />
        )}
        onChange={(_, v: AutocompleteValue) => {
          onChange(v?.value);
        }}
      />
    );
  }
};

export const ComboBox = ({
  helperText,
  showError,
  ...rest
}: ComboBoxProps & AutoCompleteComboBox) => {
  return (
    <FormControl fullWidth error={showError}>
      <NativeSelectOrComboBox {...rest} />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export const LabeledComboBox = ({
  id,
  label,
  helperText,
  showError,
  ...rest
}: ComboBoxProps & AutoCompleteComboBox & { id: string }) => {
  const errorStyles = showError ? { color: 'error.main' } : {};

  return (
    <FormControl fullWidth error={showError}>
      <label htmlFor={id}>
        <Text sx={errorStyles}>
          <b>{label}</b>
        </Text>
      </label>
      <NativeSelectOrComboBox id={id} {...rest} />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
