type SelectValue = string | number | readonly string[] | undefined;

export interface DropdownProps {
  showInputLabel?: boolean;
  values: Map<SelectValue, SelectValue>;
  helperText?: string;
  disableUnderline?: boolean;
  sortByKeys?: boolean;
  showError?: boolean;
}
