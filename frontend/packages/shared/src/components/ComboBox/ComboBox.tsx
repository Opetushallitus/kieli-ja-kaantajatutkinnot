import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Autocomplete,
  AutocompleteProps,
  Checkbox,
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
  placeholder?: string;
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

export const sortOptionsByLabels = (
  options: Array<ComboBoxOption>,
  locale: string = 'fi-FI',
) => {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });

  return options.sort((a, b) => collator.compare(a.label, b.label));
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
  placeholder,
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
      value: rest.value || undefined,
      disabled: rest.disabled,
      'data-testid': rest['data-testid'],
      variant: 'outlined',
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
            placeholder={placeholder}
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

type AutoCompleteMultipleComboBox = AutocompleteProps<
  ComboBoxOption,
  true,
  false,
  false
>;

export const LabeledMultipleCheckboxDropdown = ({
  id,
  label,
  helperText,
  showError,
  values,
  variant,
  value,
  onChange,
  ...rest
}: Omit<ComboBoxProps, 'value' | 'onChange' | 'showInputLabel'> &
  Omit<AutoCompleteMultipleComboBox, 'options' | 'renderInput'> & {
    id: string;
  }) => {
  const errorStyles = showError ? { color: 'error.main' } : {};
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <FormControl fullWidth error={showError}>
      <label htmlFor={id}>
        <Text sx={errorStyles}>
          <b>{label}</b>
        </Text>
      </label>
      <Autocomplete
        id={id}
        multiple
        disableCloseOnSelect
        options={values}
        value={value}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;

          return (
            <li key={key} {...optionProps}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option?.label}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} variant={variant} error={showError} />
        )}
        onChange={onChange}
        {...rest}
      />
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
