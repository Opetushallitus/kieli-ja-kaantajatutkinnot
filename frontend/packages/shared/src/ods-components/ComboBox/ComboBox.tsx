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
import { useState } from 'react';

import {
  CustomNativeSelectProps,
  NativeSelect,
} from '../../components/NativeSelect/NativeSelect';
import { Text } from '../../components/Text/Text';
import { useWindowProperties } from '../../hooks';
import {
  AutoCompleteComboBox,
  ComboBoxOption,
  ComboBoxProps as SharedComboBoxProps,
} from '../../interfaces';

export type AutocompleteValue = ComboBoxOption | null;
type ComboBoxProps = SharedComboBoxProps & {
  onChange: (value?: string) => void;
};

type OdsAutoCompleteComboBox = Omit<
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
  value,
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
}: ComboBoxProps & OdsAutoCompleteComboBox) => {
  const { isPhone } = useWindowProperties();
  const [hasPointerFocus, setHasPointerFocus] = useState(false);
  const getOptionLabel = (option: AutocompleteValue): string => {
    const [activeOption] = values.filter(
      (value) => value.value === option?.value,
    );

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
        onChange={(event) => onChange(event.target.value as string)}
      />
    );
  }

  return (
    <Autocomplete
      disablePortal
      {...rest}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      options={values}
      filterOptions={filterOptions}
      onPointerDown={(event) => {
        setHasPointerFocus(true);
        rest.onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        setHasPointerFocus(false);
        rest.onKeyDown?.(event);
      }}
      onBlur={(event) => {
        setHasPointerFocus(false);
        rest.onBlur?.(event);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant={variant}
          error={showError}
          placeholder={placeholder}
          InputLabelProps={{
            ...params.InputLabelProps,
            sx: label
              ? {
                  backgroundColor: 'background.paper',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '1.4375em',
                  px: 0.5,
                }
              : undefined,
          }}
          InputProps={{
            ...params.InputProps,
            sx: {
              ...(label
                ? {
                    '&&:has(input:focus-visible)': {
                      zIndex: 0,
                    },
                    '&& .MuiOutlinedInput-notchedOutline': {
                      top: -5,
                      '& legend': {
                        lineHeight: '11px',
                      },
                    },
                  }
                : {}),
              ...(hasPointerFocus
                ? {
                    '&&:has(input:focus-visible)': {
                      outline: 'none',
                      zIndex: 0,
                    },
                  }
                : {}),
            },
          }}
        />
      )}
      onChange={(_, value: AutocompleteValue) => {
        onChange(value?.value);
      }}
    />
  );
};

export const ComboBox = ({
  helperText,
  showError,
  ...rest
}: ComboBoxProps & OdsAutoCompleteComboBox) => (
  <FormControl fullWidth error={showError}>
    <NativeSelectOrComboBox {...rest} />
    {showError && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);

export const LabeledComboBox = ({
  id,
  label,
  helperText,
  showError,
  ...rest
}: ComboBoxProps & OdsAutoCompleteComboBox & { id: string }) => {
  const errorStyles = showError ? { color: 'error.main' } : {};

  return (
    <FormControl fullWidth error={showError}>
      <label htmlFor={id}>
        <Text sx={errorStyles}>{label}</Text>
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
        isOptionEqualToValue={(option, currentValue) =>
          option.value === currentValue.value
        }
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

export type { AutoCompleteComboBox };
