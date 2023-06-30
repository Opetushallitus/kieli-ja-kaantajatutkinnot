import {
  CustomTextField,
  CustomTextFieldProps,
} from '../CustomTextField/CustomTextField';
import { Text } from '../Text/Text';

export type LabeledTextFieldProps = {
  id: string;
  label: string;
} & CustomTextFieldProps;

export const LabeledTextField = ({
  id,
  label,
  placeholder,
  error,
  ...rest
}: LabeledTextFieldProps) => {
  const errorStyles = error ? { color: 'error.main' } : {};

  return (
    <div className="rows">
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
