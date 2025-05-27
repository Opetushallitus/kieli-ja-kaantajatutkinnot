import { TextField, TextFieldProps } from '@mui/material';

export const CustomTextField = ({
  error,
  helperText,
  multiline,
  ...rest
}: TextFieldProps) => {
  const minRows = multiline ? 5 : undefined;
  const maxRows = multiline ? 15 : undefined;

  return (
    <TextField
      minRows={minRows}
      maxRows={maxRows}
      error={error}
      multiline={multiline}
      helperText={helperText}
      {...rest}
    />
  );
};
