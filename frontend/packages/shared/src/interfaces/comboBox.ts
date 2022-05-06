import { AutocompleteProps } from '@mui/material';

import { TextFieldVariant } from '../enums/common';

export type ComboBoxOption = { label: string; value: string };
export type AutocompleteValue = ComboBoxOption | null;
export interface ComboBoxProps {
  label?: string;
  showInputLabel?: boolean;
  helperText?: string;
  showError?: boolean;
  variant: TextFieldVariant;
  getOptionLabel?: (option: AutocompleteValue) => string;
  values: Array<ComboBoxOption>;
  value: AutocompleteValue;
}

export type AutoCompleteComboBox = Omit<
  AutocompleteProps<AutocompleteValue, false, false, false>,
  'options' | 'renderInput'
>;
