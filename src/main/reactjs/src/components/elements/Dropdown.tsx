import {
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';

import { DropdownProps } from 'interfaces/dropdown';

export const Dropdown = ({
  showInputLabel,
  id,
  label,
  values,
  helperText,
  showError,
  sortByKeys,
  ...selectOnlyProps
}: DropdownProps & SelectProps<string>) => {
  const valuesArray = Array.from(values);
  const valuesToShow = sortByKeys ? valuesArray.sort() : valuesArray;

  const selectProps = { id, label, ...selectOnlyProps };

  return (
    <FormControl fullWidth error={showError}>
      {showInputLabel && <InputLabel id={id}>{label}</InputLabel>}
      <Select autoWidth {...selectProps}>
        {valuesToShow.map(([key, value], index) => (
          <MenuItem key={index} value={value}>
            {key}
          </MenuItem>
        ))}
      </Select>
      {showError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
