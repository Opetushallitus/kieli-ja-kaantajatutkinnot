import { ChangeEvent } from 'react';
import { CustomTextFieldProps } from 'shared/components';

import { ClerkTranslatorTextFieldEnum } from 'enums/clerkTranslator';
import { ClerkTranslatorBasicInformation } from 'interfaces/clerkTranslator';

export type ClerkTranslatorTextFieldProps = {
  translator?: ClerkTranslatorBasicInformation;
  field: ClerkTranslatorTextFieldEnum;
  displayError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;
