import { TextFieldProps } from '@mui/material';
import { ChangeEvent } from 'react';

import {
  ClerkTranslatorAddressFieldEnum,
  ClerkTranslatorTextFieldEnum,
} from 'enums/clerkTranslator';
import {
  ClerkTranslatorAddress,
  ClerkTranslatorBasicInformation,
} from 'interfaces/clerkTranslator';

export type ClerkTranslatorAddressFieldProps = {
  translator?: ClerkTranslatorAddress;
  field: ClerkTranslatorAddressFieldEnum;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & TextFieldProps;

export type ClerkTranslatorTextFieldProps = {
  translator?: ClerkTranslatorBasicInformation;
  field: ClerkTranslatorTextFieldEnum;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & TextFieldProps;
