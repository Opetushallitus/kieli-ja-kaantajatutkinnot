import { ChangeEvent } from 'react';

import { ClerkTranslatorTextFieldEnum } from 'enums/clerkTranslator';
import { ClerkTranslatorBasicInformation } from 'interfaces/clerkTranslator';
import { CustomTextFieldProps } from 'interfaces/components/customTextField';

export type ClerkTranslatorTextFieldProps = {
  translator?: ClerkTranslatorBasicInformation;
  field: ClerkTranslatorTextFieldEnum;
  displayError: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;
