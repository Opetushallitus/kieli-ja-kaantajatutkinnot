import { TextField, TextFieldProps } from '@mui/material';
import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';

const gaps = {
  gapped: '2rem',
  'gapped-xl': '3rem',
  'gapped-xxl': '4rem',
  'gapped-xxxxl': '6rem',
  'gapped-sm': '1rem',
  'gapped-xs': '0.75rem',
  'gapped-xxs': '0.5rem',
};

export type LabeledTextFieldProps = TextFieldProps & {
  id: string;
  label: string;
  gap?: keyof typeof gaps;
};

// Keep the TextField API during migration (including read-only slot props and
// validation helper text). ODS owns the label and form layout; app layout props
// apply to the whole field rather than just the input.
export const LabeledTextField = ({
  id,
  label,
  placeholder,
  error,
  gap,
  className,
  sx,
  fullWidth,
  required,
  disabled,
  multiline,
  minRows,
  maxRows,
  ...rest
}: LabeledTextFieldProps) => (
  <OphFormFieldWrapper
    className={className}
    sx={[
      ...(gap ? [{ gap: gaps[gap] }] : []),
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
    fullWidth={fullWidth}
    label={label}
    helperText={placeholder}
    error={error}
    disabled={disabled}
    // Existing callers include an asterisk in their translated label.
    required={required && !label.trimEnd().endsWith('*')}
    renderInput={({ labelId }) => (
      <TextField
        {...rest}
        id={id}
        error={error}
        required={required}
        disabled={disabled}
        multiline={multiline}
        minRows={minRows ?? (multiline ? 5 : undefined)}
        maxRows={maxRows ?? (multiline ? 15 : undefined)}
        inputProps={{ ...rest.inputProps, 'aria-labelledby': labelId }}
      />
    )}
  />
);
