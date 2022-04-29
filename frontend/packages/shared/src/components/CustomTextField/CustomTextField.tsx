import { TextField, TextFieldProps } from '@mui/material';

export type CustomTextFieldProps = {
  showHelperText?: boolean;
} & TextFieldProps;

export const CustomTextField = ({
  error,
  helperText,
  showHelperText,
  multiline,
  ...rest
}: CustomTextFieldProps) => {
  const minRows = multiline ? 5 : undefined;
  const maxRows = multiline ? 15 : undefined;

  return (
    <TextField
      minRows={minRows}
      maxRows={maxRows}
      error={error}
      multiline={multiline}
      helperText={(error || showHelperText) && helperText}
      {...rest}
    />
  );
};
