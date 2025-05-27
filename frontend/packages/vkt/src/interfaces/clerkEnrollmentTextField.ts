import { TextFieldProps } from '@mui/material';
import { ChangeEvent } from 'react';

import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';

export type ClerkEnrollmentTextFieldProps<T> = {
  enrollment: T;
  field: ClerkEnrollmentTextFieldEnum;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isViewMode: boolean;
} & TextFieldProps;
