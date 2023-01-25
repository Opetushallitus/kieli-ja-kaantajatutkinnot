import { ChangeEvent } from 'react';
import { CustomTextFieldProps } from 'shared/components';

import { ClerkEnrollmentTextFieldEnum } from 'enums/clerkEnrollment';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';

export type ClerkEnrollmentTextFieldProps = {
  enrollment: ClerkEnrollment;
  field: ClerkEnrollmentTextFieldEnum;
  showFieldError: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & CustomTextFieldProps;
