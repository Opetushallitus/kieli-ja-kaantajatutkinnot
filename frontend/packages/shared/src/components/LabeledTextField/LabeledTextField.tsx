import { TextFieldProps } from '@mui/material';

import { CustomTextField } from '../CustomTextField/CustomTextField';
import { Text } from '../Text/Text';

type GAP =
  | 'gapped'
  | 'gapped-xl'
  | 'gapped-xxl'
  | 'gapped-xxxxl'
  | 'gapped-sm'
  | 'gapped-xs'
  | 'gapped-xxs';

export type LabeledTextFieldProps = {
  id: string;
  label: string;
  gap?: GAP;
} & TextFieldProps;

export const LabeledTextField = ({
  id,
  label,
  placeholder,
  error,
  gap,
  ...rest
}: LabeledTextFieldProps) => {
  const errorStyles = error ? { color: 'error.main' } : {};

  return (
    <div className={gap ? `rows ${gap}` : 'rows'}>
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
