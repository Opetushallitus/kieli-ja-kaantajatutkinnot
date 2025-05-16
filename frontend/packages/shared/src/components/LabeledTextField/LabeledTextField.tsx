import { TextFieldProps } from '@mui/material';

import { CustomTextField } from '../CustomTextField/CustomTextField';
import { Text } from '../Text/Text';

export type LabeledTextFieldProps = {
  id: string;
  label: string;
  className?: string;
} & TextFieldProps;

export const LabeledTextField = ({
  id,
  label,
  placeholder,
  error,
  className,
  ...rest
}: LabeledTextFieldProps) => {
  const errorStyles = error ? { color: 'error.main' } : {};

  return (
    <div className={className ?? 'rows'}>
      <label htmlFor={id}>
        <Text sx={errorStyles}>
          <b>{label}</b>
        </Text>
      </label>
      {placeholder && <Text sx={errorStyles}>{placeholder}</Text>}
      <CustomTextField id={id} error={error} {...rest} />
    </div>
  );
};
