import { TextField, TextFieldProps } from '@mui/material';

import { TextBoxProps } from 'interfaces/textBox';

export const TextBox = ({
  error,
  helperText,
  showHelperText,
  ...rest
}: TextBoxProps & TextFieldProps) => {
  return (
    <TextField
      error={error}
      helperText={(error || showHelperText) && helperText}
      {...rest}
    />
  );
};
