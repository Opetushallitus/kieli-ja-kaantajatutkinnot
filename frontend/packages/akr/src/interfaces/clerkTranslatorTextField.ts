import { ChangeEvent } from 'react';
import { CustomTextFieldProps } from 'shared/components';

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
} & CustomTextFieldProps;

export type ClerkTranslatorTextFieldProps = {
  translator?: ClerkTranslatorBasicInformation;
  field: ClerkTranslatorTextFieldEnum;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;
