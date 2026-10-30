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
  Select,
  TextField,
} from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useState } from 'react';

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
    return (
      <div onBlur={rest.onBlur} onFocus={rest.onFocus}>
        <Select
          native
          id={rest.id}
          value={rest.value?.value || ''}
          disabled={rest.disabled}
          error={showError}
          variant="outlined"
          fullWidth
          className={rest.className}
          sx={rest.sx}
          inputProps={{
            'aria-label': rest['aria-label'] || label,
            'aria-labelledby': rest['aria-labelledby'],
            'aria-describedby': rest['aria-describedby'],
            'data-testid': rest['data-testid'],
          }}
          onChange={(event) => onChange(event.target.value || undefined)}
        >
          <option value="">{placeholder || label || ''}</option>
          {values.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
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
    <NativeSelectOrComboBox showError={showError} {...rest} />
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
        <OphTypography variant="label" component="span" sx={errorStyles}>
          {label}
        </OphTypography>
      </label>
      <NativeSelectOrComboBox id={id} showError={showError} {...rest} />
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
        <OphTypography variant="label" component="span" sx={errorStyles}>
          {label}
        </OphTypography>
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
