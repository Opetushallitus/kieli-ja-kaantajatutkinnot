import { ChangeEvent } from 'react';
import { CustomTextFieldProps } from 'shared/components';

import { ClerkInterpreterTextFieldEnum } from 'enums/clerkInterpreter';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';

export type ClerkInterpreterTextFieldProps = {
  interpreter?: ClerkInterpreter;
  field: ClerkInterpreterTextFieldEnum;
  displayError: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;
