import { ChangeEvent } from 'react';
import { CustomTextFieldProps } from 'shared/components';

import { ClerkTranslatorBasicInformation } from 'interfaces/clerkTranslator';

export type ClerkTranslatorTextFieldProps<T> = {
  translator?: ClerkTranslatorBasicInformation;
  field: T;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;
