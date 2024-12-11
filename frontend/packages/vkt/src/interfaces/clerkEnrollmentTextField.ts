import { ChangeEvent } from 'react';
import { CustomTextFieldProps } from 'shared/components';

import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';

export type ClerkEnrollmentTextFieldProps<T> = {
  enrollment: T;
  field: ClerkEnrollmentTextFieldEnum;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isViewMode: boolean;
} & CustomTextFieldProps;
